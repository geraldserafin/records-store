import { Vinyl } from '../../vinyls/entities/vinyl.entity';
import { Column, OneToMany, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity({ name: 'authors' })
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Vinyl, (vinyl) => vinyl.author)
  vinyls: Vinyl[];
}
