import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import googleConfig from './google.config';
import sessionConfig from './session.config';
import stripeConfig from './stripe.config';
import appConfig from './app.config';
import emailsConfig from './emails.config';

export default ConfigModule.forRoot({
  isGlobal: true,
  load: [
    databaseConfig,
    googleConfig,
    sessionConfig,
    stripeConfig,
    appConfig,
    emailsConfig,
  ],
});
