import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Record } from '../../records/entities/record.entity';

@Entity({ name: 'artists' })
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  image: string;

  @OneToMany(() => Record, (record) => record.mainArtist)
  mainRecords: Record[];

  @ManyToMany(() => Record, (record) => record.coArtists)
  coRecords: Record[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}