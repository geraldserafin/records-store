import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { CategoryAttribute } from './category-attribute.entity';

@Entity({ name: 'product_attribute_value' })
export class ProductAttributeValue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true, name: 'string_value' })
  stringValue: string;

  @Column({ type: 'double', nullable: true, name: 'number_value' })
  numberValue: number;

  @Column({ type: 'boolean', nullable: true, name: 'boolean_value' })
  booleanValue: boolean;

  @ManyToOne(() => Product, (product) => product.attributeValues, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @ManyToOne(() => CategoryAttribute, (attribute) => attribute.values, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attribute_id' })
  attribute: CategoryAttribute;
}
