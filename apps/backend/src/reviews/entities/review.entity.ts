import { ApiProperty } from '@nestjs/swagger';
import { Record } from '../../records/entities/record.entity';
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

  @ManyToOne(() => Record, (record) => record.reviews, { onDelete: 'CASCADE' })
  @ApiProperty({ type: () => Record })
  record: Record;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'SET NULL' })
  @ApiProperty({ type: () => User })
  author: User;
}