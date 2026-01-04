import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UsePipes,
} from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreSchema, CreateGenreDto, UpdateGenreSchema, UpdateGenreDto } from './dto/genre.schema';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Admin, Public } from '../auth/decorators/access.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Genres')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Admin()
  @Post()
  @UsePipes(new ZodValidationPipe(CreateGenreSchema))
  @ApiOperation({ summary: 'Create a new genre' })
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genresService.create(createGenreDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all genres' })
  findAll() {
    return this.genresService.findAll();
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a single genre by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.genresService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single genre by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.genresService.findOne(id);
  }

  @Admin()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a genre' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateGenreSchema)) updateGenreDto: UpdateGenreDto
  ) {
    return this.genresService.update(id, updateGenreDto);
  }

  @Admin()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a genre' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.genresService.remove(id);
  }
}