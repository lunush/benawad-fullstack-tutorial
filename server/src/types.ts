import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";
import { Field, ObjectType } from "type-graphql";
import { createCreatorLoader } from "./utils/createCreatorLoader";
import { createUpdootLoader } from "./utils/createUpdootLoader";

@ObjectType()
export class FieldError {
  @Field() message: string;
}

export type MyRequest = Request & {
  session: Session & Partial<SessionData> & { userId?: number };
};

export type MyContext = {
  req: MyRequest;
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createCreatorLoader>;
  updootLoader: ReturnType<typeof createUpdootLoader>;
};
