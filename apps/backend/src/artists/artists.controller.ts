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
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Admin, Public } from 'src/auth/decorators/access.decorator';

@ApiTags('Artists')
@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Admin()
  @Post()
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
  @Get(':id')
  @ApiOperation({ summary: 'Get a single artist' })
  findOne(@Param('id', ParseIntPipe) id: string) {
    return this.artistsService.findOne(+id);
  }

  @Admin()
  @Patch(':id')
  @ApiOperation({ summary: 'Update an artist' })
  update(@Param('id', ParseIntPipe) id: string, @Body() updateArtistDto: UpdateArtistDto) {
    return this.artistsService.update(+id, updateArtistDto);
  }

  @Admin()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an artist' })
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.artistsService.remove(+id);
  }
}
