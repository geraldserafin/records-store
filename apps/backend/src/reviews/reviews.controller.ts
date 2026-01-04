import { Controller, Param, Delete, ParseIntPipe, Post, Get, Body, Query, Req, UsePipes } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Admin, Public } from '../auth/decorators/access.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CreateReviewSchema, ReviewPageSchema, CreateReviewDto, ReviewPageDto } from './dto/review.schema';
import { Request } from 'express';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateReviewSchema))
  @ApiOperation({ summary: 'Create a review' })
  create(@Body() createReviewDto: CreateReviewDto, @Req() request: Request) {
    const user = (request as any).user;
    return this.reviewsService.create(user.id, createReviewDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List reviews' })
  findAll(@Query(new ZodValidationPipe(ReviewPageSchema)) query: ReviewPageDto) {
    return this.reviewsService.findAll(query);
  }

  @Admin()
  @Delete(':reviewId')
  @ApiOperation({ summary: 'Delete a review' })
  remove(@Param('reviewId', ParseIntPipe) reviewId: number) {
    return this.reviewsService.remove(reviewId);
  }
}