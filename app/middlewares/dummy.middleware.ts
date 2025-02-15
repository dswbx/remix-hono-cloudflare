import { createMiddleware } from "hono/factory";

export const dummy = createMiddleware<{
   Variables: {
      middleware: boolean;
   };
}>(async (c, next) => {
   console.log("running global middleware");
   c.set("middleware", true);
   await next();
});
