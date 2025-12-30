import { Product } from '../../products/entities/product.entity';
import { Author } from '../../authors/entities/author.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'vinyls' })
export class Vinyl {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Author, (author) => author.vinyls)
  author: Author;

  @OneToOne(() => Product, { eager: true, cascade: true })
  @JoinColumn()
  product: Product;
}
