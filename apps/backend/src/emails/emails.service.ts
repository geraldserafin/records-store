import { Injectable } from '@nestjs/common';
import { pruchaseSuccessfulTemplate } from './templates/pruchaseSuccessful.template';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailsService {
  constructor(private mailerService: MailerService) {}

  async purchaseSuccessful({ to }: { to: string }) {
    await this.mailerService.sendMail({
      to,
      subject: 'Purchase completed!',
      html: pruchaseSuccessfulTemplate(),
    });
  }
}
