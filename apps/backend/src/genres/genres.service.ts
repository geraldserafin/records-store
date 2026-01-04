import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from './entities/genre.entity';
import { CreateGenreDto, UpdateGenreDto } from './dto/genre.schema';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async create(dto: CreateGenreDto): Promise<Genre> {
    const genre = this.genreRepository.create(dto);
    return await this.genreRepository.save(genre);
  }

  async findAll(): Promise<Genre[]> {
    return await this.genreRepository.find();
  }

  async findOne(id: number): Promise<Genre> {
    const genre = await this.genreRepository.findOne({
      where: { id },
      relations: ['records'],
    });
    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }
    return genre;
  }

  async findBySlug(slug: string): Promise<Genre> {
    const genre = await this.genreRepository.findOne({
      where: { slug },
      relations: ['records'],
    });
    if (!genre) {
      throw new NotFoundException(`Genre with slug ${slug} not found`);
    }
    return genre;
  }

  async update(id: number, dto: UpdateGenreDto): Promise<Genre> {
    const genre = await this.findOne(id);
    Object.assign(genre, dto);
    return await this.genreRepository.save(genre);
  }

  async remove(id: number): Promise<void> {
    const genre = await this.findOne(id);
    await this.genreRepository.remove(genre);
  }
}