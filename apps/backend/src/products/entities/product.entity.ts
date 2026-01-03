import { OrderItem } from '../../purchases/entities/order-item.entity';
import { Review } from '../../reviews/entities/review.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { Artist } from '../../artists/entities/artist.entity';
import { Genre } from '../../genres/entities/genre.entity';

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

  @ManyToMany(() => Artist, (artist) => artist.products, { eager: true })
  @JoinTable({ name: 'product_artists' })
  artists: Artist[];

  @ManyToMany(() => Genre, (genre) => genre.products, { eager: true })
  @JoinTable({ name: 'product_genres' })
  genres: Genre[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
