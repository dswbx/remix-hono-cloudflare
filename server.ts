import { createRequestHandler, type ServerBuild } from "@remix-run/cloudflare";
import { Hono } from "hono";
import * as build from "./build/server";
import type { PlatformProxy } from "wrangler";
import honoRoutes from "~/hono";
import { dummy, viteInfo } from "~/middlewares";

const handleRemixRequest = createRequestHandler(build as any as ServerBuild);
const dev = process.env.NODE_ENV !== "production";

const app = new Hono<{
   Bindings: Env;
}>().use(dummy, viteInfo);

type HonoContext = typeof app extends Hono<infer T> ? T : never;

declare global {
   type HonoEnv = {
      Bindings: HonoContext["Bindings"];
   };
   type HonoAppEnv = HonoContext;
}

type CloudflareContext = Omit<
   PlatformProxy<Env>,
   "dispose" | "caches" | "cf"
> & {
   caches: PlatformProxy<Env>["caches"] | CacheStorage;
   cf: Request["cf"];
   vars: HonoContext["Variables"];
};

declare module "@remix-run/cloudflare" {
   interface AppLoadContext extends CloudflareContext {}
}

app.route("/hono", honoRoutes);

app.all("*", async (c) => {
   const request = c.req.raw;

   try {
      const context = {
         cf: request.cf,
         ctx: c.executionCtx,
         env: c.env as Env,
         caches,
         vars: c.var,
      } as const satisfies CloudflareContext;

      try {
         // @ts-expect-error only in vite
         if (dev && import.meta.env) {
            // @ts-expect-error it's not typed
            const devBuild = await import("virtual:remix/server-build");
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
