import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Vinyl } from './entities/vinyl.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVinylDto } from './dto/create-vinyl.dto';
import { VinylPageDto } from './dto/vinyl-page.dto';
import { createPage } from 'src/create-page';
import { Review } from 'src/reviews/entities/review.entity';
import { UpdateVinylDto } from './dto/update-vinyl.dto';
import { ProductStats } from 'src/products/entities/product-stats.entity';
import { Product, ProductType } from 'src/products/entities/product.entity';
import { Author } from 'src/authors/entities/author.entity';

@Injectable()
export class VinylsService {
  constructor(
    @InjectRepository(Vinyl) private vinylsRepository: Repository<Vinyl>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
  ) {}
  async findAll(vinylPageDto: VinylPageDto) {
    const queryBuilder = this.vinylsRepository
      .createQueryBuilder('vinyl')
      .leftJoinAndSelect('vinyl.author', 'author')
      .leftJoinAndSelect('vinyl.product', 'product')
      .leftJoinAndMapOne(
        'product.stats',
        ProductStats,
        'productStats',
        'productStats.productId = product.id',
      )
      .leftJoinAndMapOne(
        'product.reviews',
        Review,
        'latestReview',
        'latestReview.productId = vinyl.id AND latestReview.id = (SELECT r.id FROM review r WHERE r.productId = product.id ORDER BY r.id DESC LIMIT 1)',
      );

    return await createPage(queryBuilder, vinylPageDto, {
      authorName: 'author.name',
      name: 'product.name',
      price: 'product.price',
    });
  }

  findOne(id: number) {
    return this.vinylsRepository.findOneBy({ id });
  }

  async create({ price, name, description }: CreateVinylDto, author: Author) {
    const product = this.productsRepository.create({
      name,
      price,
      description,
      productType: ProductType.Vinyl,
    });

    const vinyl = this.vinylsRepository.create({
      product,
      author,
    });

    return this.vinylsRepository.save(vinyl);
  }

  update(id: number, { price, name, description, authorId }: UpdateVinylDto) {
    return this.vinylsRepository.update(
      { id },
      { product: { price, name, description }, author: { id: authorId } },
    );
  }
}
