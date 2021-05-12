import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; creatorId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findByIds(keys as any);

      const updootIdsToUpdoot: Record<string, Updoot> = {};
      updoots.forEach((u: Updoot) => {
        updootIdsToUpdoot[`${u.creatorId}|${u.postId}`] = u;
      });

      return keys.map(
        (key) => updootIdsToUpdoot[`${key.creatorId}|${key.postId}`]
      );
    }
  );
