# Remix + Hono on Cloudflare PoC

Remix doesn't support middlewares yet (and probably never will because of the change to react-router). This PoC aims to combine Hono and Remix to enable middlewares and exclusive Hono features.

Demo: https://remix-hono-cloudflare.dswbx.workers.dev/

## Run it

Install dependencies:

```sh
npm install
```

Run with vite:

```sh
npm run dev
```

Run with wrangler:

```sh
npm run start
```

## What's done

-  [x] React routes including styling at `/` (see `app/routes/_index.tsx`)
-  [x] Remix API endpoint with cloudflare and hono context at `/remix` (see `app/routes/remix.ts`)
-  [x] Sub-hono exposed from Remix API endpoint with cloudflare and Remix context at `/subhono` (see `app/routes/subhono.ts`). Note though that the variables declared in the global middleware are NOT added, that's expected.
-  [x] Raw hono route with cloudflare and hono context at `/hono` (see `app/hono.ts`)
-  [x] Fully typed, vars from `wrangler.json` and `.dev.vars` are picked up correctly
-  [x] Execution context works in all routes/variants (check console)
-  [x] Verified working state with deploy
