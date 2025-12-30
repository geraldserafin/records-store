import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  stipeSecret: process.env.STRIPE_SECRET,
  stripeWebHookSecret: process.env.STRIPE_WEBHOOK_SECRET,
}));
