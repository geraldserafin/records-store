import {
  Body,
  Controller,
  Headers,
  Post,
  RawBody,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { Public } from 'src/auth/decorators/access.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { EmailsService } from 'src/emails/emails.service';
import { ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('purchases')
export class PurchasesController {
  constructor(
    private readonly purchasesService: PurchasesService,
    private readonly emailsService: EmailsService,
  ) {}

  @Public() // Allow guests
  @Post()
  @ApiOperation({
    summary:
      'Create a new order and returns the stripe page url to complete it',
  })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() request: Request,
  ) {
    const user = (request as any).user;
    return this.purchasesService.create(createOrderDto, user);
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

    // Email notification logic might need updates if we have guest emails
    // For now simple pass.
    
    return { received: true };
  }
}