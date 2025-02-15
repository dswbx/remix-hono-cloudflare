import { createRequestHandler, type ServerBuild } from "@remix-run/cloudflare";
import { Hono } from "hono";
import * as build from "./build/server";
import type { PlatformProxy } from "wrangler";
import honoRoutes from "~/hono";

const handleRemixRequest = createRequestHandler(build as any as ServerBuild);

type Variables = {
   middleware?: boolean;
   vite?: boolean;
};

declare global {
   type HonoEnv = {
      Bindings: Env;
   };
   type GlobalHonoEnv = HonoEnv & { Variables: Variables };
}

const app = new Hono<GlobalHonoEnv>().use(async (c, next) => {
   console.log("running global middleware");
   c.set("middleware", true);

   let vite = false;
   try {
      vite = global?.process?.release?.name === "node";
   } catch (e) {}

   c.set("vite", vite);

   await next();
});
const dev = process.env.NODE_ENV !== "production";

type CloudflareContext = Omit<
   PlatformProxy<Env>,
   "dispose" | "caches" | "cf"
> & {
   caches: PlatformProxy<Env>["caches"] | CacheStorage;
   cf: Request["cf"];
   vars: Variables;
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
