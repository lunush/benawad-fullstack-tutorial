import { MikroORM } from "@mikro-orm/core";
import config from "./mikro-orm.config";

const main = async () => {
  const orm = await MikroORM.init(config);
  await orm.getMigrator().up();
};

main().catch((error) => console.log(error));
