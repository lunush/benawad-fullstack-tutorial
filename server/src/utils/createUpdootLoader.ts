import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; creatorId: number }, Updoot | null>(
    async (keys) => {
      // BUG: findByIds sends "Updoot.id = null" if it's not provided
      // More info: https://github.com/typeorm/typeorm/issues/4411
      const updoots = await Updoot.findByIds(keys as any[]);

      const updootIdsToUpdoot: Record<string, Updoot> = {};
      updoots.forEach((u: Updoot) => {
        updootIdsToUpdoot[`${u.creatorId}|${u.postId}`] = u;
      });

      console.log("updootIdsToUpdoot: ", updootIdsToUpdoot, updoots, keys);

      return keys.map(
        (key) => updootIdsToUpdoot[`${key.creatorId}|${key.postId}`]
      );
    }
  );
