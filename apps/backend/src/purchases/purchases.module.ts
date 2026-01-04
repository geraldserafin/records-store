import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { RecordsModule } from '../records/records.module';
import { EmailsModule } from '../emails/emails.module';
import { Record } from '../records/entities/record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Record]), 
    RecordsModule, 
    EmailsModule
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
