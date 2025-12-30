import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { VinylsService } from './vinyls.service';
import { VinylPageDto } from './dto/vinyl-page.dto';
import { Admin, Public } from 'src/auth/decorators/access.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CreateReviewDto } from 'src/reviews/dto/create-review.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { ReviewsService } from 'src/reviews/reviews.service';
import { ReviewPageDto } from 'src/reviews/dto/review-page.dto';
import { CreateVinylDto } from './dto/create-vinyl.dto';
import { UpdateVinylDto } from './dto/update-vinyl.dto';
import { AuthorsService } from 'src/authors/authors.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Vinyl } from './entities/vinyl.entity';
import { Page } from 'src/create-page';
import { Review } from 'src/reviews/entities/review.entity';

@Controller('vinyls')
export class VinylsController {
  constructor(
    private readonly vinylsService: VinylsService,
    private readonly reviewsService: ReviewsService,
    private readonly authorsService: AuthorsService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Return a page of vinyls' })
  @ApiOkResponse({ type: () => Page<Vinyl> })
  find(@Query() pageOptions: VinylPageDto) {
    return this.vinylsService.findAll(pageOptions);
  }

  @Admin()
  @Post()
  @ApiOperation({ summary: 'Create a new vinyl' })
  @ApiCreatedResponse({ type: () => Vinyl })
  async create(@Body() createVinylDto: CreateVinylDto) {
    const author = await this.authorsService.findOne(createVinylDto.authorId);

    if (!author) {
      throw new NotFoundException(
        `Author with id: ${createVinylDto.authorId} not found.`,
      );
    }

    return this.vinylsService.create(createVinylDto, author);
  }

  @Admin()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a vinyl' })
  @ApiOkResponse()
  patch(
    @Param('id', ParseIntPipe) vinylId: number,
    @Body() updateVinylDto: UpdateVinylDto,
  ) {
    this.vinylsService.update(vinylId, updateVinylDto);
  }

  @Public()
  @Get(':id/reviews')
  @ApiOperation({ summary: 'Return a list of reviews for a given vinyl' })
  @ApiOkResponse({ type: () => Page<Vinyl> })
  findAll(
    @Param('id', ParseIntPipe) vinylId: number,
    @Query() reviewsPageDto: ReviewPageDto,
  ) {
    return this.reviewsService.findAll(vinylId, reviewsPageDto);
  }

  @Post(':id/reviews')
  @ApiOperation({ summary: 'Create a new review of a vinyl' })
  @ApiOkResponse({ type: () => Review })
  async createReview(
    @CurrentUser() user: UserDto,
    @Param('id', ParseIntPipe) vinylId: number,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    try {
      return await this.reviewsService.create(
        vinylId,
        user.id,
        createReviewDto,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      throw new NotFoundException();
    }
  }
}
