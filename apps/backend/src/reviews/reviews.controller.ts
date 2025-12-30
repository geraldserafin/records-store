import { Controller, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Admin } from 'src/auth/decorators/access.decorator';
import { ApiOperation } from '@nestjs/swagger';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Admin()
  @Delete(':reviewId')
  @ApiOperation({ summary: 'Delete a review' })
  remove(@Param('reviewId', ParseIntPipe) reviewId: number) {
    return this.reviewsService.remove(reviewId);
  }
}
