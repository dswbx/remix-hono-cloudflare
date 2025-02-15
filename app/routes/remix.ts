import { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { getRuntimeKey } from "hono/adapter";

export const loader = async (args: LoaderFunctionArgs) => {
   args.context.ctx.waitUntil(
      (async () => {
         await new Promise((resolve) => setTimeout(resolve, 1000));
         console.log("waitUntil() from remix context works!");
      })()
   );

   return Response.json({
      message: "Hello from remix!",
      env: args.context.env,
      runtime: getRuntimeKey(),
      vite: args.context.vite,
   });
};
