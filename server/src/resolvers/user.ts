import argon2 from "argon2";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../contstants";
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
  isLoggedIn,
  validateChangePasswordInput,
  validateLoginInput,
  validateRegistrationInput,
} from "../utils/validation";
import { RegistrationInput } from "../utils/RegistrationInput";
import { LoginInput } from "../utils/LoginInput";
import { v4 as uuid } from "uuid";
import { sendEmail } from "../utils/sendEmail";
import { ChangePasswordInput } from "../utils/ChangePasswordInput";

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
  async changePassword(
    @Arg("options") options: ChangePasswordInput,
    @Ctx() { em, redis, req }: MyContext
  ): Promise<UserResponse> {
    const { newPassword, token } = options;

    const inputErrors = validateChangePasswordInput(options, req);
    if (inputErrors) return inputErrors;

    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);

    if (!userId)
      return {
        errors: [{ message: "Token has expired or is invalid" }],
      };

    const user = await em.findOne(User, { id: parseInt(userId) });

    if (!user)
      return {
        errors: [{ message: "User no longer exists" }],
      };

    const hashedPassword = await argon2.hash(newPassword);

    user.password = hashedPassword;
    await em.persistAndFlush(user);

    await redis.del(FORGET_PASSWORD_PREFIX + token);

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis, req }: MyContext
  ) {
    if (isLoggedIn(req)) return true;

    const user = await em.findOne(User, { email });

    if (!user) return true;

    const token = uuid();

    const TOKEN_VALID_PERIOD = 1000 * 60 * 10; // 10 minutes

    redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      TOKEN_VALID_PERIOD
    );

    await sendEmail(
      email,
      `<a href="https://localhost:3000/change-password/${token}">Reset Password</a>`
    );

    return true;
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
