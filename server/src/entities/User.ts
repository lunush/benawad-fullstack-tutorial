import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { Updoot } from "./Updoot";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Field({ nullable: true })
  @Column({ unique: true, nullable: true })
  email?: string;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.creator)
  posts!: Post[];

  @Field(() => [Updoot])
  @OneToMany(() => Updoot, (updoot) => updoot.creator)
  updoots!: Updoot[];

  @Column()
  password!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt!: Date;
}
