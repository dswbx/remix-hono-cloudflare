import { createMiddleware } from "hono/factory";

export const viteInfo = createMiddleware<{
   Variables: {
      vite: boolean;
   };
}>(async (c, next) => {
   let vite = false;
   try {
      vite = global?.process?.release?.name === "node";
   } catch (e) {}

   c.set("vite", vite);

   await next();
});
