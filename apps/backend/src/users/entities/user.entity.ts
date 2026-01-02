import { Order } from '../../purchases/entities/order.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  Admin = 'admin',
  User = 'user',
}

export enum AuthProvider {
  Google = 'google',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ enum: AuthProvider, type: 'enum' })
  provider: AuthProvider;

  @Column({ enum: UserRole, type: 'enum', default: UserRole.User })
  role: UserRole;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ name: 'birth_date', type: 'datetime', nullable: true })
  birthDate: Date;

  @OneToMany(() => Review, (review) => review.author)
  reviews: Review[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
