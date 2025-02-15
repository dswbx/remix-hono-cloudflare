import { Hono } from "hono";
import { getRuntimeKey } from "hono/adapter";

const app = new Hono<HonoAppEnv>().get("/", async (c) => {
   c.executionCtx.waitUntil(
      (async () => {
         await new Promise((resolve) => setTimeout(resolve, 1000));
         console.log("waitUntil() from raw hono context works!");
      })()
   );

   return c.json({
      message: "Hello from raw Hono!",
      url: c.req.url,
      env: c.env,
      runtime: getRuntimeKey(),
      vars: c.var,
   });
});

export default app;
