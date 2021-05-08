import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ type: "int" })
  value!: number;

  @Field()
  @PrimaryColumn()
  creatorId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.updoots)
  creator!: User;

  @Field()
  @PrimaryColumn()
  postId!: number;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.updoots)
  post!: Post;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
}
