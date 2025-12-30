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
import { Purchase } from './entities/purchase.entity';
import { CartItemDto, CreatePurchaseDto } from './dto/create-purchase.dto';
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

    @InjectRepository(Purchase)
    private readonly purchasesRepository: Repository<Purchase>,
  ) {
    this.stripe = new Stripe(stripeConfig.stipeSecret);
  }

  async create({ items }: CreatePurchaseDto, user: User) {
    const productIds = items.map(({ productId }) => +productId);
    const products = await this.productsRepository.find({
      where: {
        id: In(productIds),
      },
    });

    if (products.length !== productIds.length) {
      const foundProductIds = products.map(({ id }) => id);
      const missingProductIds = productIds.filter(
        (id) => !foundProductIds.includes(id),
      );
      throw new NotFoundException(
        `Couldnt find product with id: ${missingProductIds.join(', ')} `,
      );
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: products.map((product) => {
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
            unit_amount: product.price * 100,
          },
          quantity: cartProduct.quantity,
        };
      }),
      mode: 'payment',
      success_url: `${this.appConfig.appUrl}/purchases/success`,
      cancel_url: `${this.appConfig.appUrl}/purchases/cancel`,
      metadata: {
        items: JSON.stringify(items),
        user: JSON.stringify(user),
      },
    });

    return { url: session.url };
  }

  async handleWebhook(
    signature: string,
    rawBody: Buffer,
  ): Promise<
    { type: 'checkout.session.completed'; user: User } | { type: '' }
  > {
    const webhookSecret = this.stripeConfig.stripeWebHookSecret;

    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const user = JSON.parse(session.metadata.user) as User;
        const products = JSON.parse(session.metadata.items) as CartItemDto[];

        const purchase = this.purchasesRepository.create(
          products.map(({ productId }) => ({
            user: { id: +user.id },
            product: { id: +productId },
          })),
        );

        await this.purchasesRepository.save(purchase);

        return { type: 'checkout.session.completed', user };
      }
      return { type: '' };
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message} `);
    }
  }
}
