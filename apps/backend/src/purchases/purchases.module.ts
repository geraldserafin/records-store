import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from './entities/purchase.entity';
import { ProductsModule } from 'src/products/products.module';
import { EmailsModule } from 'src/emails/emails.module';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase]), ProductsModule, EmailsModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
