import argon2 from "argon2";
import { COOKIE_NAME } from "../contstants";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";

import { User } from "../entities/User";
import {
  validateLoginInput,
  validateRegistrationInput,
} from "../utils/validation";
import { RegistrationInput } from "../utils/RegistrationInput";
import { LoginInput } from "../utils/LoginInput";

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
  @Query(() => User, { nullable: true })
  async me(@Ctx() { em, req }: MyContext) {
    if (!req.session.userId) return null;

    const user = await em.findOne(User, { id: req.session.userId });

    // if (!user) return { errors: [{ message: "Corrupted session" }] };
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: RegistrationInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const { username, email, password } = options;

    const inputErrors = validateRegistrationInput(options, req);
    if (inputErrors) return inputErrors;

    const hashedPassword = await argon2.hash(password);
    const user = em.create(User, { username, email, password: hashedPassword });
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

    const inputErrors = validateLoginInput(options, req);
    if (inputErrors) return inputErrors;

    const user = await em.findOne(User, { username });
    if (!user) return { errors: [{ message: "Invalid username or password" }] };

    const isPasswordCorrect = await argon2.verify(user.password, password);

    if (isPasswordCorrect) {
      req.session.userId = user.id;
      return { user };
    } else return { errors: [{ message: "Invalid username or password" }] };
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) => {
      res.clearCookie(COOKIE_NAME);
      req.session.destroy((err) => {
        if (err) resolve(false);
        else resolve(true);
      });
    });
  }
}
