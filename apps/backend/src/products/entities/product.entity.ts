import { OrderItem } from '../../purchases/entities/order-item.entity';
import { Review } from '../../reviews/entities/review.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { ProductAttributeValue } from './product-attribute-value.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  shortDescription: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ type: 'int', default: 0 })
  stock: number;

  @ManyToOne(() => ProductCategory, (category) => category.products, {
    eager: true,
    onDelete: 'CASCADE'
  })
  category: ProductCategory;

  @OneToMany(() => ProductAttributeValue, (value) => value.product, {
    cascade: true,
    eager: true,
  })
  attributeValues: ProductAttributeValue[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
