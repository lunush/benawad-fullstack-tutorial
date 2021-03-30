import argon2 from "argon2";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";

import { User } from "../entities/User";

@InputType()
class RegistrationInput {
  @Field() username: string;
  @Field() password: string;
  @Field() confirmPassword: string;
}

@InputType()
class LoginInput {
  @Field() username: string;
  @Field() password: string;
}

@ObjectType()
class FieldError {
  @Field() message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true }) errors?: FieldError[];
  @Field(() => User, { nullable: true }) user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => UserResponse)
  async me(@Ctx() { em, req }: MyContext): Promise<UserResponse> {
    if (!req.session.userId)
      return {
        errors: [{ message: "You are not logged in" }],
      };

    const user = await em.findOne(User, { id: req.session.userId });

    if (!user) return { errors: [{ message: "Corrupted session" }] };

    return { user };
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: RegistrationInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const { username, password, confirmPassword } = options;

    if (req.session.userId)
      return {
        errors: [{ message: "You are already logged in" }],
      };

    if (username.length < 2)
      return {
        errors: [{ message: "Username cannot be less than 2 characters" }],
      };

    if (password.length < 2)
      return {
        errors: [{ message: "Password cannot be less than 2 characters" }],
      };

    if (password !== confirmPassword)
      return { errors: [{ message: "Passwords do not match" }] };

    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, { username, password: hashedPassword });
    try {
      await em.persistAndFlush(user);
      req.session.userId = user.id;
    } catch (error) {
      // Duplicate username error
      if (error.code === "23505" || error.detail.includes("already exists")) {
        return { errors: [{ message: "User already exists" }] };
      }
    }
    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: LoginInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const { username, password } = options;

    if (req.session.userId)
      return {
        errors: [{ message: "You are already logged in" }],
      };

    if (username.length < 2)
      return {
        errors: [{ message: "Username cannot be less than 2 characters" }],
      };

    if (password.length < 2)
      return {
        errors: [{ message: "Password cannot be less than 2 characters" }],
      };

    const user = await em.findOne(User, { username });
    if (!user) return { errors: [{ message: "Invalid username or password" }] };

    const isPasswordCorrect = await argon2.verify(user.password, password);

    if (isPasswordCorrect) {
      req.session.userId = user.id;
      return { user };
    } else return { errors: [{ message: "Invalid username or password" }] };
  }
}
