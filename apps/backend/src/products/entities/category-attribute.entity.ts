import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { ProductAttributeValue } from './product-attribute-value.entity';

export enum AttributeType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Select = 'select',
}

export enum AttributeSection {
  Top = 'top',
  Bottom = 'bottom',
}

@Entity({ name: 'category_attribute' })
@Unique(['name', 'category'])
export class CategoryAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: AttributeType,
    default: AttributeType.String,
  })
  type: AttributeType;

  @Column({ type: 'json', nullable: true })
  options: string[];

  @Column({
    type: 'enum',
    enum: AttributeSection,
    default: AttributeSection.Top,
  })
  displaySection: AttributeSection;

  @ManyToOne(() => ProductCategory, (category) => category.attributes, { onDelete: 'CASCADE' })
  category: ProductCategory;

  @OneToMany(() => ProductAttributeValue, (value) => value.attribute)
  values: ProductAttributeValue[];
}
