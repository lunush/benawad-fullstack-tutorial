import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  const error = new Promise((res) =>
    res({ errors: [{ message: "You are not logged in" }] })
  );

  console.log(context.req.session.userId);

  if (!context.req.session.userId) return error;

  return next();
};
