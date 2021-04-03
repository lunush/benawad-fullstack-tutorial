import { MikroORM } from "@mikro-orm/core";
import config from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import { COOKIE_NAME, PROD } from "./contstants";
import { MyContext } from "./types";
import cors from "cors";

const main = async () => {
  const orm = await MikroORM.init(config);
  await orm.getMigrator().up();

  const app = express();
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res, redis }),
  });

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      saveUninitialized: false,
      secret: "4reghfnbdferwrteghdgetwredascsvfHJIYG",
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: "lax",
        secure: PROD,
      },
    })
  );

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000);
};

main().catch((error) => console.log(error));
