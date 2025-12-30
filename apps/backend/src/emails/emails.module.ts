import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import emailsConfig from 'src/config/emails.config';

@Module({
  imports: [
    ConfigModule.forFeature(emailsConfig),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('email.host'),
          port: configService.get('email.port'),
          secure: configService.get('email.secure'),
          auth: {
            user: configService.get('email.auth.user'),
            pass: configService.get('email.auth.pass'),
          },
        },
        defaults: {
          from: configService.get('email.from'),
        },
      }),
    }),
  ],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
