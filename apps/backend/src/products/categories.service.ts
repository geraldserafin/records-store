import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
  ) {}

  findAll() {
    return this.categoryRepo.find({
      relations: { children: true, parent: true },
    });
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: { children: true, parent: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    return await this.categoryRepo.remove(category);
  }

  async create(name: string, parentId?: number) {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Category name is required');
    }

    const categoryName = name.trim();
    const existing = await this.categoryRepo.findOneBy({ name: categoryName });
    if (existing) {
      throw new ConflictException(`Category "${categoryName}" already exists`);
    }

    let parent = null;
    if (parentId) {
      parent = await this.categoryRepo.findOneBy({ id: parentId });
      if (!parent) throw new NotFoundException(`Parent category ${parentId} not found`);
    }

    const category = this.categoryRepo.create({ name: categoryName, parent });
    return this.categoryRepo.save(category);
  }

  /**
   * Recursively finds all descendant category IDs (including the given ID).
   */
  async getDescendantIds(categoryId: number): Promise<number[]> {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: { children: true },
    });

    if (!category) return [];

    let ids = [category.id];
    for (const child of category.children) {
      const childIds = await this.getDescendantIds(child.id);
      ids = [...ids, ...childIds];
    }
    return ids;
  }

  async update(id: number, details: { name?: string, parentId?: number }) {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) throw new NotFoundException(`Category ${id} not found`);

    if (details.name) category.name = details.name;
    if (details.parentId !== undefined) {
      if (details.parentId === null) {
        category.parent = null;
      } else {
        const parent = await this.categoryRepo.findOneBy({ id: details.parentId });
        if (!parent) throw new NotFoundException(`Parent category ${details.parentId} not found`);
        category.parent = parent;
      }
    }

    return await this.categoryRepo.save(category);
  }
}
