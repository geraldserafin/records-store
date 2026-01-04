import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  RawBody,
  Req,
  UsePipes,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { Public } from '../auth/decorators/access.decorator';
import { CreateOrderSchema, CreateOrderDto } from './dto/order.schema';
import { ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('purchases')
export class PurchasesController {
  constructor(
    private readonly purchasesService: PurchasesService,
  ) {}

  @Public() // Allow guests
  @Post()
  @UsePipes(new ZodValidationPipe(CreateOrderSchema))
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

  @Get('orders')
  @ApiOperation({ summary: 'Get all orders for the current user' })
  findAll(@Req() request: Request) {
    const user = (request as any).user;
    return this.purchasesService.findAllByUser(user.id);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get order details' })
  findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(+id);
  }

  @Public()
  @Get('verify/:sessionId')
  @ApiOperation({ summary: 'Verify a stripe session and create order if needed' })
  verify(@Param('sessionId') sessionId: string) {
    return this.purchasesService.verifySession(sessionId);
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
    await this.purchasesService.handleWebhook(
      signature,
      rawBody,
    );
    
    return { received: true };
  }
}