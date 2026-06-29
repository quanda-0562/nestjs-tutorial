import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Article Entity
 *
 * Represents an article in the database
 * Articles have a one-to-many relationship with users (author)
 * Articles have a many-to-many relationship with users (favorites)
 */
@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  slug!: string;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column('text')
  body!: string;

  @Column('simple-array', { default: '' })
  tagList!: string[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column({ default: 0 })
  favoritesCount!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @Column()
  authorId!: number;

  @ManyToMany(() => User, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'article_favorites',
    joinColumn: { name: 'articleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  favoritedBy!: User[];
}
