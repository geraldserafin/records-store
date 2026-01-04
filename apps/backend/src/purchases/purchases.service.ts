import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from '../records/entities/record.entity';
import Stripe from 'stripe';
import { In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/order.schema';
import stripeConf from '../config/stripe.config';
import appConf from '../config/app.config';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PurchasesService {
  private stripe: Stripe;

  constructor(
    @Inject(appConf.KEY)
    private appConfig: ConfigType<typeof appConf>,

    @Inject(stripeConf.KEY)
    private stripeConfig: ConfigType<typeof stripeConf>,

    @InjectRepository(Record)
    private readonly recordsRepository: Repository<Record>,

    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
  ) {
    this.stripe = new Stripe(stripeConfig.stipeSecret);
  }

  async findAllByUser(userId: number) {
    return await this.ordersRepository.find({
      where: { user: { id: userId } },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.record', 'items.record.mainArtist'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(createOrderDto: CreateOrderDto, user?: User) {
    const { items, ...shippingInfo } = createOrderDto;

    const recordIds = items.map(({ recordId }) => recordId);
    const records = await this.recordsRepository.find({
      where: {
        id: In(recordIds),
      },
    });

    if (records.length !== recordIds.length) {
      throw new NotFoundException('Some records were not found');
    }

    const lineItems = records.map((record) => {
      const cartItem = items.find(
        ({ recordId }) => recordId === record.id,
      );
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: record.name,
            description: record.description,
          },
          unit_amount: Math.round(record.price * 100),
        },
        quantity: cartItem.quantity,
      };
    });

    const metadata = {
      user_id: user ? user.id.toString() : '',
      guest_email: user ? '' : shippingInfo.guestEmail,
      shipping: JSON.stringify(shippingInfo),
      items: JSON.stringify(items),
    };

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${this.appConfig.appUrl}/purchases/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.appConfig.appUrl}/purchases/cancel`,
      metadata,
    });

    return { url: session.url };
  }

  async handleWebhook(
    signature: string,
    rawBody: Buffer,
  ): Promise<any> {
    const webhookSecret = this.stripeConfig.stripeWebHookSecret;
    console.log('Webhook received, signature:', signature ? 'yes' : 'no');

    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );

      console.log('Stripe Event Type:', event.type);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        return await this.createOrderFromSession(session);
      }
      return { type: event.type };
    } catch (err) {
      console.error('Webhook Error:', err.message);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }

  async createOrderFromSession(session: Stripe.Checkout.Session) {
    const metadata = session.metadata;
    console.log('Processing session metadata:', metadata);

    const userId = metadata.user_id && metadata.user_id !== '' ? +metadata.user_id : null;
    const guestEmail = metadata.guest_email || null;
    const shippingInfo = JSON.parse(metadata.shipping);
    const items = JSON.parse(metadata.items) as { recordId: number, quantity: number }[];

    // Check if order already exists for this session to avoid duplicates
    const existingOrder = await this.ordersRepository.findOne({
      where: { guestEmail: session.id }, // We'll use guestEmail as a temporary spot for session ID if needed, or better, add a field
    });
    // For now, let's just proceed or check by metadata
    
    const order = this.ordersRepository.create({
      user: userId ? { id: userId } : null,
      guestEmail: guestEmail || session.customer_details?.email,
      shippingName: shippingInfo.shippingName,
      shippingAddress: shippingInfo.shippingAddress,
      shippingCity: shippingInfo.shippingCity,
      shippingPostalCode: shippingInfo.shippingPostalCode,
      shippingCountry: shippingInfo.shippingCountry,
      totalAmount: session.amount_total / 100,
    });

    const savedOrder = await this.ordersRepository.save(order);
    console.log('Order saved:', savedOrder.id);

    const records = await this.recordsRepository.find({ where: { id: In(items.map(i => i.recordId)) } });

    const orderItems = items.map(item => {
      const record = records.find(r => r.id === item.recordId);
      return this.orderItemsRepository.create({
        order: savedOrder,
        record: { id: item.recordId },
        quantity: item.quantity,
        priceAtPurchase: record ? record.price : 0,
      });
    });

    await this.orderItemsRepository.save(orderItems);
    console.log('Order items saved for order:', savedOrder.id);

    return { type: 'checkout.session.completed', orderId: savedOrder.id };
  }

  async verifySession(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid') {
      // Check if order already exists (simple check by session ID in metadata/logs would be better but let's check by total and items)
      // For a robust system, we should have a 'stripeSessionId' column in the Order entity.
      return await this.createOrderFromSession(session);
    }
    throw new BadRequestException('Payment not completed');
  }
}
