import { Field, InputType } from "type-graphql";

@InputType()
export class RegistrationInput {
  @Field() username: string;
  @Field({ nullable: true }) email?: string;
  @Field() password: string;
  @Field() confirmPassword: string;
}
