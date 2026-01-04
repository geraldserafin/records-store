import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Record } from '../../records/entities/record.entity';

@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @ManyToOne(() => Record, { nullable: true, onDelete: 'SET NULL' })
  record: Record;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'float' })
  priceAtPurchase: number;
}