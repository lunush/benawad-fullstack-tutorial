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
import { getConnection } from "typeorm";

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
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) return null;

    const user = await User.findOne(req.session.userId);

    // if (!user) return { errors: [{ message: "Corrupted session" }] };
    return user;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("options") options: ChangePasswordInput,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    const { newPassword, token } = options;

    const inputErrors = validateChangePasswordInput(options, req);
    if (inputErrors) return inputErrors;

    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);

    if (!userId)
      return {
        errors: [{ message: "Token has expired or is invalid" }],
      };

    const userIdNum = parseInt(userId);
    const user = await User.findOne(userIdNum);

    if (!user)
      return {
        errors: [{ message: "User no longer exists" }],
      };

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    );
    await redis.del(FORGET_PASSWORD_PREFIX + token);

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis, req }: MyContext
  ) {
    if (isLoggedIn(req)) return true;

    const user = await User.findOne({ where: { email } });

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
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const { username, email, password } = options;

    const inputErrors = validateRegistrationInput(options, req);
    if (inputErrors) return inputErrors;

    const hashedPassword = await argon2.hash(password);
    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username,
          email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
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
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const { username, password } = options;

    const inputErrors = validateLoginInput(options, req);
    if (inputErrors) return inputErrors;

    const user = await User.findOne({ where: { username } });
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
