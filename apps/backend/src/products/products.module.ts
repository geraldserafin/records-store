import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductCategory } from './entities/product-category.entity';
import { ProductsService } from './products.service';
import { CategoriesService } from './categories.service';
import { ProductsController } from './products.controller';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductCategory,
    ]),
  ],
  providers: [ProductsService, CategoriesService],
  controllers: [ProductsController, CategoriesController],
  exports: [ProductsService, CategoriesService],
})
export class ProductsModule {}