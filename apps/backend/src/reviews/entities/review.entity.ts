import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'int' })
  @ApiProperty()
  score: number;

  @Column()
  @ApiProperty()
  description: string;

  @ManyToOne(() => Product, (product) => product.reviews)
  @ApiProperty({ type: () => Product })
  product: Product;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'SET NULL' })
  @ApiProperty({ type: () => User })
  author: User;
}
