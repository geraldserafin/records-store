import {
  Body,
  Controller,
  Headers,
  Post,
  RawBody,
  Redirect,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { Public } from 'src/auth/decorators/access.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { EmailsService } from 'src/emails/emails.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('purchases')
export class PurchasesController {
  constructor(
    private readonly purchasesService: PurchasesService,
    private readonly emailsService: EmailsService,
  ) {}

  @Post()
  @Redirect()
  @ApiOperation({
    summary:
      'Create a new checkout and redirects to a stripe page to complete it',
  })
  create(
    @CurrentUser() user: User,
    @Body() createPurchaseDto: CreatePurchaseDto,
  ) {
    return this.purchasesService.create(createPurchaseDto, user);
  }

  @Public()
  @Post('webhook')
  @ApiOperation({
    summary: 'Handle webooks comming from stripe',
  })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @RawBody() rawBody: Buffer,
  ) {
    const result = await this.purchasesService.handleWebhook(
      signature,
      rawBody,
    );

    if (result.type === 'checkout.session.completed') {
      await this.emailsService.purchaseSuccessful({ to: result.user.email });
    }

    return { received: true };
  }
}
