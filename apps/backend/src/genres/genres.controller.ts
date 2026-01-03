import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { GenresService } from './genres.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Admin, Public } from 'src/auth/decorators/access.decorator';

@ApiTags('Genres')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Admin()
  @Post()
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
  @Get(':id')
  @ApiOperation({ summary: 'Get a single genre' })
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.genresService.findOne(+id);
  }

  @Admin()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a genre' })
  update(@Param('id', ParseIntPipe) id: string, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genresService.update(+id, updateGenreDto);
  }

  @Admin()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a genre' })
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.genresService.remove(+id);
  }
}
