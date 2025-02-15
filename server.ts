import { createRequestHandler } from "@react-router/cloudflare";
import { type ServerBuild } from "react-router";
import { Hono } from "hono";
import * as build from "./build/server"; // eslint-disable-line import/no-unresolved
import type { PlatformProxy } from "wrangler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleRemixRequest = createRequestHandler(build as any as ServerBuild);

declare global {
   type HonoEnv = {
      Bindings: Env;
   };
}

const app = new Hono<HonoEnv>();
const dev = process.env.NODE_ENV !== "production";

type CloudflareContext = Omit<
   PlatformProxy<Env>,
   "dispose" | "caches" | "cf"
> & {
   caches: PlatformProxy<Env>["caches"] | CacheStorage;
   cf: Request["cf"];
   vite: boolean;
};

declare module "@remix-run/cloudflare" {
   // eslint-disable-next-line @typescript-eslint/no-empty-interface
   interface AppLoadContext extends CloudflareContext {
      // This will merge the result of `getLoadContext` into the `AppLoadContext`
   }
}

app.all("*", async (c) => {
   const request = c.req.raw;

   let vite = false;
   try {
      vite = global?.process?.release?.name === "node";
   } catch (e) {}

   try {
      const context = {
         cf: request.cf,
         ctx: c.executionCtx,
         env: c.env as Env,
         caches,
         vite,
      } as const satisfies CloudflareContext;

      try {
         // @ts-ignore only in vite
         if (dev && import.meta.env) {
            // @ts-expect-error it's not typed
            const devBuild = await import("virtual:react-router/server-build");
            const handler = createRequestHandler(devBuild, "development");
            return handler(request, context);
         }
      } catch (e) {}

      return await handleRemixRequest(request, context);
   } catch (error) {
      console.log(error);
      return new Response("An unexpected error occurred", { status: 500 });
   }
});

export default app;
