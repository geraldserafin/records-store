import { Purchase } from '../../purchases/entities/purchase.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

export enum AuthProvider {
  GOOGLE = 'google',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', enum: AuthProvider })
  provider: AuthProvider;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ name: 'birth_date', nullable: true })
  birthDate: Date;

  @OneToMany(() => Review, (review) => review.author)
  reviews: Review[];

  @OneToMany(() => Purchase, (purchase) => purchase.user)
  purchases: Purchase[];
}
