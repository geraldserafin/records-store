import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { createPage } from 'src/create-page';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductCategory } from './entities/product-category.entity';
import { CategoriesService } from './categories.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { Artist } from '../artists/entities/artist.entity';
import { Genre } from '../genres/entities/genre.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
    private readonly dataSource: DataSource,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    return await this.dataSource.transaction(async (manager) => {
      const category = await manager.findOne(ProductCategory, {
        where: { id: createProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category ${createProductDto.categoryId} not found`);
      }

      // Fetch Artists and Genres if provided
      const artists = createProductDto.artistIds
        ? await manager.findBy(Artist, { id: In(createProductDto.artistIds) })
        : [];
      const genres = createProductDto.genreIds
        ? await manager.findBy(Genre, { id: In(createProductDto.genreIds) })
        : [];

      const product = manager.create(Product, {
        name: createProductDto.name,
        shortDescription: createProductDto.shortDescription,
        description: createProductDto.description,
        price: createProductDto.price,
        images: createProductDto.images,
        stock: createProductDto.stock,
        category,
        artists,
        genres,
      });

      return await manager.save(Product, product);
    });
  }

  async findAll(pageOptions: PageOptionsDto) {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.artists', 'artists')
      .leftJoinAndSelect('product.genres', 'genres');

    if (!pageOptions.filter) {
      return await createPage(queryBuilder, pageOptions);
    }

    const { name, categoryId, artistId, genreId } = pageOptions.filter;

    if (name) {
      queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }

    if (categoryId) {
      const categoryIds = await this.categoriesService.getDescendantIds(categoryId);
      if (categoryIds.length > 0) {
        queryBuilder.andWhere('product.category.id IN (:...categoryIds)', { categoryIds });
      } else {
         queryBuilder.andWhere('product.category.id = :categoryId', { categoryId });
      }
    }
    
    if (artistId) {
        queryBuilder.innerJoin('product.artists', 'filterArtist', 'filterArtist.id = :artistId', { artistId });
    }
    
    if (genreId) {
        queryBuilder.innerJoin('product.genres', 'filterGenre', 'filterGenre.id = :genreId', { genreId });
    }

    return await createPage(queryBuilder, pageOptions);
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
        artists: true,
        genres: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return await this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id },
        relations: { category: true, artists: true, genres: true },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      if (updateProductDto.name) product.name = updateProductDto.name;
      if (updateProductDto.shortDescription !== undefined)
        product.shortDescription = updateProductDto.shortDescription;
      if (updateProductDto.description)
        product.description = updateProductDto.description;
      if (updateProductDto.price) product.price = updateProductDto.price;
      if (updateProductDto.stock !== undefined)
        product.stock = updateProductDto.stock;
      if (updateProductDto.images) product.images = updateProductDto.images;

      if (updateProductDto.categoryId) {
        const category = await manager.findOne(ProductCategory, {
          where: { id: updateProductDto.categoryId },
        });
        if (!category)
          throw new NotFoundException(
            `Category ${updateProductDto.categoryId} not found`,
          );
        product.category = category;
      }

      // Update Artists if provided
      if (updateProductDto.artistIds) {
        product.artists = await manager.findBy(Artist, { id: In(updateProductDto.artistIds) });
      }

      // Update Genres if provided
      if (updateProductDto.genreIds) {
        product.genres = await manager.findBy(Genre, { id: In(updateProductDto.genreIds) });
      }

      return await manager.save(Product, product);
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return await this.productRepository.remove(product);
  }
}
