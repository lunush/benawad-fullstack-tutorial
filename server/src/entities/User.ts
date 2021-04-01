import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryKey()
  id!: number;

  @Field()
  @Property({ type: "text", unique: true })
  username!: string;

  @Field({ nullable: true })
  @Property({ type: "text", unique: true, nullable: true })
  email?: string;

  @Property({ type: "text" })
  password!: string;

  @Field(() => String)
  @Property({ type: "date", onCreate: () => new Date() })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();
}
