import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artist } from './entities/artist.entity';
import { CreateArtistDto, UpdateArtistDto } from './dto/artist.schema';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistRepository: Repository<Artist>,
  ) {}

  async create(dto: CreateArtistDto): Promise<Artist> {
    const artist = this.artistRepository.create(dto);
    return await this.artistRepository.save(artist);
  }

  async findAll(): Promise<Artist[]> {
    return await this.artistRepository.find();
  }

  async findOne(id: number): Promise<Artist> {
    const artist = await this.artistRepository.findOne({
      where: { id },
      relations: ['mainRecords', 'coRecords'],
    });
    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }
    return artist;
  }

  async findBySlug(slug: string): Promise<Artist> {
    const artist = await this.artistRepository.findOne({
      where: { slug },
      relations: ['mainRecords', 'coRecords'],
    });
    if (!artist) {
      throw new NotFoundException(`Artist with slug ${slug} not found`);
    }
    return artist;
  }

  async update(id: number, dto: UpdateArtistDto): Promise<Artist> {
    const artist = await this.findOne(id);
    Object.assign(artist, dto);
    return await this.artistRepository.save(artist);
  }

  async remove(id: number): Promise<void> {
    const artist = await this.findOne(id);
    await this.artistRepository.remove(artist);
  }
}