import {
   ActionFunctionArgs,
   LoaderFunctionArgs,
} from "@remix-run/server-runtime";
import { Hono } from "hono";
import { getRuntimeKey } from "hono/adapter";

const handler = async (args: LoaderFunctionArgs | ActionFunctionArgs) => {
   const app = new Hono<HonoEnv>().basePath("/hono");

   app.get("/", (c) => {
      c.executionCtx.waitUntil(
         (async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("waitUntil() from hono context works!");
         })()
      );

      return c.json({
         message: "Hello from Hono!",
         url: c.req.url,
         env: c.env,
         args: args.context.env,
         runtime: getRuntimeKey(),
         vite: args.context.vite,
      });
   });

   return app.fetch(args.request, args.context.env, args.context.ctx);
};

export const loader = handler;
export const action = handler;
