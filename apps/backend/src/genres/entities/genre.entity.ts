import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Record } from '../../records/entities/record.entity';

@Entity({ name: 'genres' })
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Record, (record) => record.genres)
  records: Record[];
}