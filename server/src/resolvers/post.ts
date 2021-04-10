import { Post } from "../entities/Post";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  async createPost(@Arg("title") title: string): Promise<Post> {
    return Post.create({ title }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title") title: string
  ): Promise<Post | undefined> {
    const post = await Post.findOne(id);

    if (!post) return undefined;

    await Post.update({ id }, { title });

    return Post.findOne(id);
  }

  @Mutation(() => Post, { nullable: true })
  async deletePost(@Arg("id") id: number): Promise<Boolean> {
    try {
      await Post.delete(id);
    } catch {
      return false;
    }

    return true;
  }
}
