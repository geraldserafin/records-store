import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import Stripe from 'stripe';
import { In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import stripeConf from 'src/config/stripe.config';
import appConf from 'src/config/app.config';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PurchasesService {
  private stripe: Stripe;

  constructor(
    @Inject(appConf.KEY)
    private appConfig: ConfigType<typeof appConf>,

    @Inject(stripeConf.KEY)
    private stripeConfig: ConfigType<typeof stripeConf>,

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
  ) {
    this.stripe = new Stripe(stripeConfig.stipeSecret);
  }

  async create(createOrderDto: CreateOrderDto, user?: User) {
    const { items, ...shippingInfo } = createOrderDto;

    const productIds = items.map(({ productId }) => +productId);
    const products = await this.productsRepository.find({
      where: {
        id: In(productIds),
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Some products were not found');
    }

    const lineItems = products.map((product) => {
      const cartProduct = items.find(
        ({ productId }) => productId === product.id,
      );
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: cartProduct.quantity,
      };
    });

    // We need to pass shipping info and user details to metadata
    // Be careful with 500 chars limit on metadata values. 
    // We will serialize shipping info as JSON.
    
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
      success_url: `${this.appConfig.appUrl}/purchases/success`,
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

    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        const userId = metadata.user_id ? +metadata.user_id : null;
        const guestEmail = metadata.guest_email || null;
        const shippingInfo = JSON.parse(metadata.shipping);
        const items = JSON.parse(metadata.items) as { productId: number, quantity: number }[];

        const order = this.ordersRepository.create({
          user: userId ? { id: userId } : null,
          guestEmail,
          shippingName: shippingInfo.shippingName,
          shippingAddress: shippingInfo.shippingAddress,
          shippingCity: shippingInfo.shippingCity,
          shippingPostalCode: shippingInfo.shippingPostalCode,
          shippingCountry: shippingInfo.shippingCountry,
          totalAmount: session.amount_total / 100,
        });

        const savedOrder = await this.ordersRepository.save(order);

        // Fetch products to get current price for history
        const products = await this.productsRepository.find({ where: { id: In(items.map(i => i.productId)) } });

        const orderItems = items.map(item => {
          const product = products.find(p => p.id === item.productId);
          return this.orderItemsRepository.create({
            order: savedOrder,
            product: { id: item.productId },
            quantity: item.quantity,
            priceAtPurchase: product ? product.price : 0,
          });
        });

        await this.orderItemsRepository.save(orderItems);

        return { type: 'checkout.session.completed', orderId: savedOrder.id };
      }
      return { type: '' };
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}