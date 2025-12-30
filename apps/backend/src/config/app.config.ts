import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  appUrl: process.env.APP_URL,
}));
