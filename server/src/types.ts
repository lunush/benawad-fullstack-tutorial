import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import { Redis } from "ioredis";

export type MyRequest = Request & {
  session: Session & Partial<SessionData> & { userId?: number };
};

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: MyRequest;
  res: Response;
  redis: Redis;
};
