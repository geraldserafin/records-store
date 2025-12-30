import { Module } from '@nestjs/common';
import { VinylsService } from './vinyls.service';
import { VinylsController } from './vinyls.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vinyl } from './entities/vinyl.entity';
import { AuthorsModule } from 'src/authors/authors.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vinyl]),
    AuthorsModule,
    ReviewsModule,
    ProductsModule,
  ],
  controllers: [VinylsController],
  providers: [VinylsService],
  exports: [VinylsService],
})
export class VinylsModule {}
