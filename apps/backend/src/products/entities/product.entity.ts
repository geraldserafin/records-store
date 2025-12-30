import { Purchase } from '../../purchases/entities/purchase.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum ProductType {
  Vinyl = 'vinyl',
}

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  price: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    enum: ProductType,
    name: 'product_type',
  })
  productType: ProductType;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => Purchase, (purchase) => purchase.product)
  purchases: Purchase[];
}
