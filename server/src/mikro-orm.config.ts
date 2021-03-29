import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { PROD } from "./contstants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

const config = {
  entities: [Post, User],
  dbName: "lireddit",
  type: "postgresql",
  user: "postgres",
  password: "postgres",
  migrations: {
    path: path.join(__dirname, "/migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  debug: !PROD,
} as Parameters<typeof MikroORM.init>[0];

export default config;
