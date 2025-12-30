import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { createPage } from 'src/create-page';
import { ReviewPageDto } from './dto/review-page.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
  ) {}

  create(productId: number, userId: number, createReviewDto: CreateReviewDto) {
    const vinyl = this.reviewsRepository.create(createReviewDto);

    vinyl.author = { id: userId } as User;
    vinyl.product = { id: productId } as Product;

    return this.reviewsRepository.save(vinyl);
  }

  findAll(productId: number, reviewsPageDto: ReviewPageDto) {
    const queryBuilder = this.reviewsRepository
      .createQueryBuilder()
      .where(`productId = :productId`, { productId });

    return createPage(queryBuilder, reviewsPageDto);
  }

  remove(reviewId: number) {
    const review = this.reviewsRepository.create({
      id: reviewId,
    });

    return this.reviewsRepository.remove(review);
  }
}
