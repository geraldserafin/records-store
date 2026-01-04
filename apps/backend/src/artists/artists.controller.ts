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
import { ArtistsService } from './artists.service';
import { CreateArtistSchema, CreateArtistDto, UpdateArtistSchema, UpdateArtistDto } from './dto/artist.schema';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Admin, Public } from '../auth/decorators/access.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@ApiTags('Artists')
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Admin()
  @Post()
  @UsePipes(new ZodValidationPipe(CreateArtistSchema))
  @ApiOperation({ summary: 'Create a new artist' })
  create(@Body() createArtistDto: CreateArtistDto) {
    return this.artistsService.create(createArtistDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all artists' })
  findAll() {
    return this.artistsService.findAll();
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a single artist by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.artistsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single artist by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.artistsService.findOne(id);
  }

  @Admin()
  @Patch(':id')
  @ApiOperation({ summary: 'Update an artist' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateArtistSchema)) updateArtistDto: UpdateArtistDto
  ) {
    return this.artistsService.update(id, updateArtistDto);
  }

  @Admin()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an artist' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.artistsService.remove(id);
  }
}