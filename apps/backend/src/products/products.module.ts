import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductStats } from './entities/product-stats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductStats])],
  exports: [TypeOrmModule],
})
export class ProductsModule {}
