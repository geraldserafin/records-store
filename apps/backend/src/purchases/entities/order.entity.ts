import { User } from '../../users/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ nullable: true })
  guestEmail: string;

  @Column()
  shippingName: string;

  @Column()
  shippingAddress: string;

  @Column()
  shippingCity: string;

  @Column()
  shippingPostalCode: string;

  @Column()
  shippingCountry: string;

  @Column({ type: 'float', default: 0 })
  totalAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
