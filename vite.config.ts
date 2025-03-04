import { defineConfig } from "vite";
import {
   vitePlugin as remix,
   cloudflareDevProxyVitePlugin,
} from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import devServer, { defaultOptions } from "@hono/vite-dev-server";
import adapter from "@hono/vite-dev-server/cloudflare";
import tailwindcss from "@tailwindcss/vite";

declare module "@remix-run/cloudflare" {
   interface Future {
      v3_singleFetch: true;
   }
}

export default defineConfig({
   plugins: [
      tailwindcss(),
      cloudflareDevProxyVitePlugin(),
      remix({
         future: {
            v3_fetcherPersist: true,
            v3_relativeSplatPath: true,
            v3_throwAbortReason: true,
            v3_singleFetch: true,
            v3_lazyRouteDiscovery: true,
         },
      }),
      devServer({
         adapter,
         entry: "server.ts",
         exclude: [...defaultOptions.exclude, "/assets/**", "/app/**"],
         injectClientScript: false,
      }),
      tsconfigPaths(),
   ],
   ssr: {
      resolve: {
         conditions: ["workerd", "worker", "browser"],
      },
   },
   resolve: {
      mainFields: ["browser", "module", "main"],
   },
   build: {
      minify: true,
   },
});
