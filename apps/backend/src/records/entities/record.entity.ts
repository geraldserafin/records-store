import { OrderItem } from '../../purchases/entities/order-item.entity';
import { Review } from '../../reviews/entities/review.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artist } from '../../artists/entities/artist.entity';
import { Genre } from '../../genres/entities/genre.entity';

@Entity({ name: 'records' })
export class Record {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  shortDescription: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ type: 'int', default: 0 })
  stock: number;

  @ManyToOne(() => Artist, (artist) => artist.mainRecords, { eager: true })
  mainArtist: Artist;

  @ManyToMany(() => Artist, (artist) => artist.coRecords, { eager: true })
  @JoinTable({ name: 'record_co_artists' })
  coArtists: Artist[];

  @ManyToMany(() => Genre, (genre) => genre.records, { eager: true })
  @JoinTable({ name: 'record_genres' })
  genres: Genre[];

  @OneToMany(() => Review, (review) => review.record)
  reviews: Review[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.record)
  orderItems: OrderItem[];
}
