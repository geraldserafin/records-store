import { Injectable } from '@nestjs/common';
import { CreateReviewDto, ReviewPageDto } from './dto/review.schema';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { createPage } from '../create-page';
import { Record } from '../records/entities/record.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
  ) {}

  create(userId: number, createReviewDto: CreateReviewDto) {
    const review = this.reviewsRepository.create(createReviewDto);

    review.author = { id: userId } as User;
    review.record = { id: createReviewDto.recordId } as Record;

    return this.reviewsRepository.save(review);
  }

  findAll(reviewsPageDto: ReviewPageDto) {
    const queryBuilder = this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.author', 'author')
      .leftJoinAndSelect('review.record', 'record')
      .leftJoinAndSelect('record.mainArtist', 'mainArtist') // For record display in user profile
      .orderBy('review.id', 'DESC');

    if (reviewsPageDto.recordId) {
      queryBuilder.andWhere('review.recordId = :recordId', {
        recordId: reviewsPageDto.recordId,
      });
    }

    if (reviewsPageDto.userId) {
      queryBuilder.andWhere('review.authorId = :userId', {
        userId: reviewsPageDto.userId,
      });
    }

    return createPage(queryBuilder, reviewsPageDto);
  }

  remove(reviewId: number) {
    const review = this.reviewsRepository.create({
      id: reviewId,
    });

    return this.reviewsRepository.remove(review);
  }
}