import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PageOptionsDto } from 'src/dto/page-options.dto';
import { createPage } from 'src/create-page';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductCategory } from './entities/product-category.entity';
import { ProductAttributeValue } from './entities/product-attribute-value.entity';
import { AttributeType, CategoryAttribute } from './entities/category-attribute.entity';
import { z } from 'zod';

import { CategoriesService } from './categories.service';
import { UpdateProductDto } from './dto/update-product.dto';

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

  private createCategorySchema(attributes: CategoryAttribute[]) {
    const shape: Record<string, z.ZodTypeAny> = {};
    
    attributes.forEach(attr => {
      let schema;
      switch (attr.type) {
        case AttributeType.String:
          schema = z.string();
          break;
        case AttributeType.Number:
          schema = z.coerce.number();
          break;
        case AttributeType.Boolean:
          schema = z.boolean();
          break;
        default:
          schema = z.any();
      }
      shape[attr.name] = schema;
    });

    return z.object(shape);
  }

  async create(createProductDto: CreateProductDto) {
    return await this.dataSource.transaction(async (manager) => {
      const category = await manager.findOne(ProductCategory, {
        where: { id: createProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category ${createProductDto.categoryId} not found`);
      }

      // Fetch all attributes from the hierarchy
      const allAttributes = await this.categoriesService.findAllAttributes(category.id);

      const dynamicSchema = this.createCategorySchema(allAttributes);
      const validationResult = dynamicSchema.safeParse(createProductDto.attributes || {});

      if (!validationResult.success) {
        throw new BadRequestException(validationResult.error.format());
      }

      const validatedAttributes = validationResult.data;

      const product = manager.create(Product, {
        name: createProductDto.name,
        shortDescription: createProductDto.shortDescription,
        description: createProductDto.description,
        price: createProductDto.price,
        images: createProductDto.images,
        category,
      });

      const savedProduct = await manager.save(Product, product);

      const valuesToSave = Object.entries(validatedAttributes)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          const attrDef = allAttributes.find((a) => a.name === key);
          
          const valObj = manager.create(ProductAttributeValue, {
            product: savedProduct,
            attribute: attrDef,
          });

          if (attrDef.type === AttributeType.String) valObj.stringValue = value as string;
          if (attrDef.type === AttributeType.Number) valObj.numberValue = value as number;
          if (attrDef.type === AttributeType.Boolean) valObj.booleanValue = value as boolean;

          return valObj;
        });

      if (valuesToSave.length > 0) {
        await manager.save(ProductAttributeValue, valuesToSave);
      }

      return savedProduct;
    });
  }

  async findAll(pageOptions: PageOptionsDto) {
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.attributeValues', 'attributeValues')
      .leftJoinAndSelect('attributeValues.attribute', 'attribute');

    if (!pageOptions.filter) {
      return await createPage(queryBuilder, pageOptions);
    }

    const { name, categoryId, attributes } = pageOptions.filter;

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

    if (attributes && typeof attributes === 'object') {
      Object.entries(attributes as Record<string, any>).forEach(([attrName, attrValue], index) => {
        const valAlias = `pav_${index}`;
        const attrAlias = `attr_${index}`;

        queryBuilder.innerJoin('product.attributeValues', valAlias);
        queryBuilder.innerJoin(`${valAlias}.attribute`, attrAlias);

        queryBuilder.andWhere(`${attrAlias}.name = :name_${index}`, { [`name_${index}`]: attrName });
        queryBuilder.andWhere(
          `(${valAlias}.stringValue = :val_${index} OR ${valAlias}.numberValue = :val_${index} OR ${valAlias}.booleanValue = :val_${index})`,
          { [`val_${index}`]: attrValue },
        );
      });
    }

    return await createPage(queryBuilder, pageOptions);
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
        attributeValues: {
          attribute: true,
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // 1. Fetch the full schema for this category hierarchy
    const allAttrDefs = await this.categoriesService.findAllAttributes(product.category.id);

    // 2. Ensure every attribute in the schema has at least a placeholder value object if missing
    // This allows the frontend to just loop through attributeValues and see EVERYTHING.
    // However, if we don't want to mutate DB objects, we just return a virtual merged list.
    
    // Let's just make sure the frontend knows about the definitions.
    // Actually, it's better to just ensure the frontend traversal works.
    
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return await this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id },
        relations: { category: true, attributeValues: true },
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

      const savedProduct = await manager.save(Product, product);

      // Handle Attributes Update if provided
      if (updateProductDto.attributes) {
        // 1. Fetch all valid attributes for the current (possibly updated) category
        const allAttributes = await this.categoriesService.findAllAttributes(
          product.category.id,
        );

        // 2. Validate
        const dynamicSchema = this.createCategorySchema(allAttributes);
        const validationResult = dynamicSchema.safeParse(
          updateProductDto.attributes,
        );
        if (!validationResult.success) {
          throw new BadRequestException(validationResult.error.format());
        }

        // 3. Clear existing values
        await manager.delete(ProductAttributeValue, {
          product: { id: savedProduct.id },
        });

        // 4. Create new values
        const valuesToSave = Object.entries(validationResult.data)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => {
            const attrDef = allAttributes.find((a) => a.name === key);
            const valObj = manager.create(ProductAttributeValue, {
              product: savedProduct,
              attribute: attrDef,
            });

            if (attrDef.type === AttributeType.String)
              valObj.stringValue = value as string;
            if (attrDef.type === AttributeType.Number)
              valObj.numberValue = value as number;
            if (attrDef.type === AttributeType.Boolean)
              valObj.booleanValue = value as boolean;

            return valObj;
          });

        if (valuesToSave.length > 0) {
          await manager.save(ProductAttributeValue, valuesToSave);
        }
      }

      return savedProduct;
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return await this.productRepository.remove(product);
  }
}