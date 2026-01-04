import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { createPage } from '../create-page';
import { ReviewPageDto } from './dto/review-page.dto';
import { Record } from '../records/entities/record.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
  ) {}

  create(recordId: number, userId: number, createReviewDto: CreateReviewDto) {
    const review = this.reviewsRepository.create(createReviewDto);

    review.author = { id: userId } as User;
    review.record = { id: recordId } as Record;

    return this.reviewsRepository.save(review);
  }

  findAll(recordId: number, reviewsPageDto: ReviewPageDto) {
    const queryBuilder = this.reviewsRepository
      .createQueryBuilder('review')
      .where(`review.recordId = :recordId`, { recordId });

    return createPage(queryBuilder, reviewsPageDto);
  }

  remove(reviewId: number) {
    const review = this.reviewsRepository.create({
      id: reviewId,
    });

    return this.reviewsRepository.remove(review);
  }
}