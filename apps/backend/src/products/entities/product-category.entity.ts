import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_category' })
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => ProductCategory, (category) => category.children, { nullable: true, onDelete: 'CASCADE' })
  parent: ProductCategory;

  @OneToMany(() => ProductCategory, (category) => category.parent)
  children: ProductCategory[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
