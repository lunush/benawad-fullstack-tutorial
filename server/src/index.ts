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
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { Post } from "./entities/Post";

const main = async () => {
  const conn = await createConnection({
    type: "postgres" as const,
    database: "lireddit",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [Post, User],
  });

  conn && true;

  const app = express();
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, PostResolver],
    }),
    context: ({ req, res }): MyContext => ({ req, res, redis }),
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
