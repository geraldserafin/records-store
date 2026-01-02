import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { CategoryAttribute, AttributeType, AttributeSection } from './entities/category-attribute.entity';
import { ProductAttributeValue } from './entities/product-attribute-value.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
    @InjectRepository(CategoryAttribute)
    private readonly attributeRepo: Repository<CategoryAttribute>,
    @InjectRepository(ProductAttributeValue)
    private readonly valueRepo: Repository<ProductAttributeValue>,
  ) {}

  findAll() {
    return this.categoryRepo.find({
      relations: { attributes: true },
    });
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: { attributes: true, children: true },
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
   * Recursively finds all attributes for a category and its parents.
   */
  async findAllAttributes(categoryId: number): Promise<CategoryAttribute[]> {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: { attributes: true, parent: true },
    });

    if (!category) return [];

    const parentAttributes = category.parent 
      ? await this.findAllAttributes(category.parent.id) 
      : [];

    return [...parentAttributes, ...category.attributes];
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

  async findAttribute(id: number) {
    const attribute = await this.attributeRepo.findOne({
      where: { id },
      relations: { category: true }
    });
    if (!attribute) throw new NotFoundException(`Attribute ${id} not found`);
    return attribute;
  }

  async updateAttribute(id: number, details: { name?: string, type?: AttributeType, displaySection?: AttributeSection, options?: string[] }) {
    const attribute = await this.findAttribute(id);
    if (details.name) attribute.name = details.name;
    if (details.type) attribute.type = details.type;
    if (details.displaySection) attribute.displaySection = details.displaySection;
    if (details.options) attribute.options = details.options;
    return await this.attributeRepo.save(attribute);
  }

  async removeAttribute(id: number) {
    const attribute = await this.findAttribute(id);
    return await this.attributeRepo.remove(attribute);
  }

  async addAttribute(categoryId: number, name: string, type: AttributeType, displaySection: AttributeSection = AttributeSection.Top, options?: string[]) {
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Attribute name is required');
    }

    const category = await this.findOne(categoryId);

    const attributeName = name.trim();
    const isDuplicate = category.attributes.some(a => a.name.toLowerCase() === attributeName.toLowerCase());
    
    if (isDuplicate) {
      throw new ConflictException(`Attribute "${attributeName}" already exists for category "${category.name}"`);
    }

    const attribute = this.attributeRepo.create({
      name: attributeName,
      type,
      displaySection,
      options,
      category,
    });

    return this.attributeRepo.save(attribute);
  }

  async getUniqueAttributeValues(attributeId: number) {
    const attribute = await this.attributeRepo.findOneBy({ id: attributeId });
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${attributeId} not found`);
    }

    const results = await this.valueRepo
      .createQueryBuilder('val')
      .select('DISTINCT val.string_value', 'value')
      .where('val.attribute_id = :attributeId', { attributeId })
      .andWhere('val.string_value IS NOT NULL')
      .orderBy('val.string_value', 'ASC')
      .getRawMany();
    
    return results.map(r => r.value);
  }

  async updateAttributeValues(attributeId: number, oldValue: string, newValue: string) {
    if (!oldValue || !newValue) {
      throw new BadRequestException('Both old and new values are required for update');
    }

    const attribute = await this.attributeRepo.findOneBy({ id: attributeId });
    if (!attribute) {
      throw new NotFoundException(`Attribute with ID ${attributeId} not found`);
    }

    const result = await this.valueRepo.update(
      { attribute: { id: attributeId }, stringValue: oldValue },
      { stringValue: newValue }
    );

    return { updatedCount: result.affected };
  }
}