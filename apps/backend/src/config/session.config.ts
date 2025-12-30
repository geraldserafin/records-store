import { registerAs } from '@nestjs/config';

export default registerAs('session', () => ({
  sessionSecret: process.env.SESSION_SECRET,
  sessionCookieMaxAge: process.env.SESSION_COOKIE_MAX_AGE,
}));
