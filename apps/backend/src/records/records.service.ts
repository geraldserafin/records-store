import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Record } from './entities/record.entity';
import { PageOptionsDto } from '../dto/page-options.dto';
import { createPage } from '../create-page';
import { CreateRecordDto, UpdateRecordDto, RecordFilterDto } from './dto/record.schema';
import { Artist } from '../artists/entities/artist.entity';
import { Genre } from '../genres/entities/genre.entity';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Record)
    private readonly recordRepository: Repository<Record>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateRecordDto) {
    return await this.dataSource.transaction(async (manager) => {
      const mainArtist = await manager.findOne(Artist, {
        where: { id: dto.mainArtistId },
      });
      if (!mainArtist) {
        throw new NotFoundException(`Main Artist ${dto.mainArtistId} not found`);
      }

      const coArtists = dto.coArtistIds?.length
        ? await manager.findBy(Artist, { id: In(dto.coArtistIds) })
        : [];
        
      const genres = dto.genreIds?.length
        ? await manager.findBy(Genre, { id: In(dto.genreIds) })
        : [];

      const record = manager.create(Record, {
        name: dto.name,
        shortDescription: dto.shortDescription,
        description: dto.description,
        price: dto.price,
        images: dto.images,
        stock: dto.stock,
        mainArtist,
        coArtists,
        genres,
      });

      return await manager.save(Record, record);
    });
  }

  async findAll(pageOptions: PageOptionsDto, filter?: RecordFilterDto) {
    const queryBuilder = this.recordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.mainArtist', 'mainArtist')
      .leftJoinAndSelect('record.coArtists', 'coArtists')
      .leftJoinAndSelect('record.genres', 'genres');

    if (filter) {
      if (filter.name) {
        queryBuilder.andWhere('record.name LIKE :name', { name: `%${filter.name}%` });
      }

      if (filter.artistId) {
        queryBuilder.andWhere(
          '(mainArtist.id = :artistId OR coArtists.id = :artistId)',
          { artistId: filter.artistId }
        );
      }
      
      if (filter.genreId) {
        queryBuilder.innerJoin('record.genres', 'filterGenreId', 'filterGenreId.id = :genreId', { genreId: filter.genreId });
      }

      if (filter.genreSlug) {
        queryBuilder.innerJoin('record.genres', 'filterGenreSlug', 'filterGenreSlug.slug = :genreSlug', { genreSlug: filter.genreSlug });
      }

      if (filter.section) {
        if (filter.section === 'bestsellers') {
          // Mocking bestsellers by stock for now, or just a different order
          queryBuilder.andWhere('record.stock < 50');
          queryBuilder.addOrderBy('record.price', 'DESC');
        } else if (filter.section === 'classics') {
          queryBuilder.andWhere('record.price > 100');
        } else if (filter.section === 'new-arrivals') {
          queryBuilder.addOrderBy('record.id', 'DESC');
        }
      }
    }

    return await createPage(queryBuilder, pageOptions);
  }

  async findOne(id: number) {
    const record = await this.recordRepository.findOne({
      where: { id },
      relations: {
        mainArtist: true,
        coArtists: true,
        genres: true,
      },
    });

    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }

    return record;
  }

  async update(id: number, dto: UpdateRecordDto) {
    return await this.dataSource.transaction(async (manager) => {
      const record = await manager.findOne(Record, {
        where: { id },
        relations: { mainArtist: true, coArtists: true, genres: true },
      });

      if (!record) {
        throw new NotFoundException(`Record with ID ${id} not found`);
      }

      if (dto.name) record.name = dto.name;
      if (dto.shortDescription !== undefined) record.shortDescription = dto.shortDescription;
      if (dto.description) record.description = dto.description;
      if (dto.price) record.price = dto.price;
      if (dto.stock !== undefined) record.stock = dto.stock;
      if (dto.images) record.images = dto.images;

      if (dto.mainArtistId) {
        const mainArtist = await manager.findOne(Artist, { where: { id: dto.mainArtistId } });
        if (!mainArtist) throw new NotFoundException(`Main Artist ${dto.mainArtistId} not found`);
        record.mainArtist = mainArtist;
      }

      if (dto.coArtistIds) {
        record.coArtists = await manager.findBy(Artist, { id: In(dto.coArtistIds) });
      }

      if (dto.genreIds) {
        record.genres = await manager.findBy(Genre, { id: In(dto.genreIds) });
      }

      return await manager.save(Record, record);
    });
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return await this.recordRepository.remove(record);
  }

  async search(query: string, pageOptions: PageOptionsDto) {
    const queryBuilder = this.recordRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.mainArtist', 'mainArtist')
      .leftJoinAndSelect('record.coArtists', 'coArtists')
      .leftJoinAndSelect('record.genres', 'genres');

    if (!query) {
      return await createPage(queryBuilder, pageOptions);
    }

    const words = query.trim().split(/\s+/);
    
    words.forEach((word, index) => {
      const p = `word${index}`;
      queryBuilder.andWhere(
        `(record.name LIKE :${p} OR 
          record.name SOUNDS LIKE :${p} OR 
          mainArtist.name LIKE :${p} OR 
          mainArtist.name SOUNDS LIKE :${p} OR
          coArtists.name LIKE :${p} OR
          coArtists.name SOUNDS LIKE :${p})`,
        { [p]: `%${word}%` }
      );
    });

    return await createPage(queryBuilder, pageOptions);
  }
}
