---
title: Bappi's Next.js & Web Patterns
description: Next.js ISR patterns, OTT web architecture, Tamagui cross-platform integration, Tailwind setup, syncpack/knip for monorepo health, web-specific service patterns, Expo Router API routes (+api.ts), and EAS Hosting Cloudflare Workers constraints.
type: reference
---

# Bappi's Next.js & Web Patterns

## ISR (Incremental Static Regeneration)

Used for content-heavy OTT apps where data changes on a schedule, not in real-time:

```ts
// pages/[slug].tsx
export async function getStaticProps({ params }) {
    const data = await fetchContent(params.slug);
    return {
        props: { data },
        revalidate: 60, // regenerate at most once per minute
    };
}

export async function getStaticPaths() {
    const items = await fetchAllSlugs();
    return {
        paths: items.map(item => ({ params: { slug: item.slug } })),
        fallback: "blocking", // generate on first request for unknown slugs
    };
}
```

ISR is appropriate when: data is publicly cacheable, freshness tolerance is minutes not seconds, and you want CDN-level performance.

---

## App Router (Newer Projects)

```
app/
  layout.tsx                ← Root layout: providers, fonts, metadata
  page.tsx                  ← Home
  (auth)/
    layout.tsx
    login/page.tsx
  (dashboard)/
    layout.tsx              ← Protected layout with auth check
    page.tsx
  [slug]/
    page.tsx                ← Dynamic routes
```

Server components by default. Add `"use client"` only when needed (hooks, event handlers, browser APIs).

---

## Tamagui Cross-Platform

One component library for both React Native and web. Key patterns:

### File Splitting

```
packages/app/
  components/
    MyButton.tsx            ← Universal (uses Tamagui primitives)
  ui/
    input.ui.tsx            ← Native version
    input.ui.web.tsx        ← Web-specific variant
```

Metro and Next.js both resolve `*.web.tsx` on web, `*.tsx` on native.

### isWeb Branch for Navigation

```ts
import { isWeb } from "tamagui";
import { router } from "expo-router";

function navigateToHome() {
    if (isWeb) {
        // Next.js navigation — handled by parent via callback
        onSuccess?.();
    } else {
        router.replace("/home");
    }
}
```

### Token Service Web Branch

```ts
import { isWeb } from "tamagui";

static async setToken(token: string) {
    if (isWeb) {
        globalThis?.localStorage?.setItem(TOKEN_KEY, token);
        return;
    }
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}
```

### Query Persistence Web Branch

```ts
import { isWeb } from "tamagui";

const persister = isWeb
    ? createLocalStoragePersister({ storage: globalThis.localStorage })
    : createAsyncStoragePersister({ storage: asyncStorage });
```

### Tamagui Package Build

```json
{
    "scripts": {
        "build": "tamagui-build --skip-types",
        "watch": "tamagui-build --skip-types --watch"
    }
}
```

The UI package must be built before the apps can consume it. Turborepo handles the order.

---

## Tailwind Setup (Monorepo)

```ts
// packages/tailwind-config/index.ts
export default {
    content: ["./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#3990ff",
                danger: "#ec0041",
            },
        },
    },
};
```

Apps extend the shared config:
```js
// apps/web/tailwind.config.ts
import sharedConfig from "@myapp/tailwind-config";
export default { ...sharedConfig, content: ["./src/**/*.{ts,tsx}"] };
```

---

## Next.js Config

```js
// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
    transpilePackages: ["@myapp/ui", "@myapp/config"],
    images: {
        domains: ["cdn.myapp.com", "s3.amazonaws.com"],
    },
    experimental: {
        serverComponentsExternalPackages: ["@prisma/client"],
    },
};
```

`transpilePackages` is required for any package that ships uncompiled TypeScript.

---

## Web-Specific Service Pattern

In cross-platform monorepos, some services split into native/web variants:

```
packages/config/src/services/
  use-auth.service.ts       ← Shared logic
  web-services/
    use-auth.web.service.ts ← Web-only: uses Next.js redirect, cookies
  native-services/
    use-auth.native.service.ts ← Native-only: uses expo-router, SecureStore
```

---

## Dependency Health (Web Monorepo)

### syncpack — Consistent Versions

```json
// .syncpackrc.json
{
    "semverGroups": [{ "range": "^", "dependencies": ["**"] }],
    "versionGroups": [
        { "dependencies": ["react", "react-dom"], "packages": ["**"] }
    ]
}
```

```sh
syncpack list-mismatches   # find
syncpack fix-mismatches    # auto-fix
```

### knip — Dead Code Detection

```ts
// knip.config.ts
export default {
    workspaces: {
        ".": { entry: ["index.ts"] },
        "apps/web": { entry: ["src/app/**/*.tsx"] },
        "packages/ui": { entry: ["src/index.ts"] },
    },
    ignore: ["**/*.stories.tsx"],
};
```

```sh
knip                       # find unused files, exports, deps
knip --dependencies        # focus on unused npm deps
```

---

## Expo Router API Routes

Server-side endpoints co-located in the `app/` directory using the `+api.ts` file suffix. Deployed to EAS Hosting — runs on **Cloudflare Workers**, not Node.js.

### File Naming

```
app/
  api/
    hello+api.ts            → GET /api/hello
    users+api.ts            → /api/users
    users/[id]+api.ts       → /api/users/:id
```

### Route Structure

```ts
// app/api/users/[id]+api.ts
export function GET(request: Request, { id }: { id: string }) {
  return Response.json({ userId: id });
}

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json({ created: true }, { status: 201 });
}
```

Each HTTP method is a named export. Dynamic route params are passed as the second argument.

### When to Use

- Hiding secrets from the client (API keys, DB credentials)
- Proxying third-party APIs
- Server-side validation before hitting a database
- Webhook receivers
- Rate limiting at server level

### When NOT to Use

- Real-time updates (no WebSockets — use a dedicated service)
- Heavy file I/O (no `fs` module on Workers)
- Simple CRUD already handled by a managed backend (Supabase, Firebase)

---

### EAS Hosting Runtime Constraints

API routes on EAS Hosting run on **Cloudflare Workers** — not Node.js. This changes what's available:

| Unavailable | Use instead |
|-------------|------------|
| `fs` module | Not available — no filesystem |
| Node crypto | Web Crypto API (`crypto.subtle`) |
| Native Node modules | Web API equivalents only |
| Persistent connections | No WebSockets — use Durable Objects or external service |
| Long-running processes | 30-second CPU timeout |

**Database must be cloud-based** (Workers can't reach `localhost`):
- Turso / libSQL — distributed SQLite at the edge
- Neon — serverless Postgres
- PlanetScale — serverless MySQL
- Supabase — Postgres with REST API

```ts
// Turso example
import { createClient } from "@libsql/client/web";

const db = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function GET() {
  const result = await db.execute("SELECT * FROM users");
  return Response.json(result.rows);
}
```

---

### Environment Variables

Server-side secrets via `process.env` — never `EXPO_PUBLIC_`:

```ts
// ✅ Server-only — safe
const apiKey = process.env.OPENAI_API_KEY;

// ❌ Exposed to client bundle
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
```

Local: add to `.env` (never commit). EAS Hosting: `eas env:create --name KEY --value val --environment production`.

---

### CORS

```ts
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export function GET() {
  return Response.json({ data: "value" }, { headers: corsHeaders });
}
```

Always add an `OPTIONS` export when CORS is needed — preflight requests hit it first.

---

### Auth Pattern

```ts
async function requireAuth(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return verifyToken(token); // returns decoded payload
}

export async function GET(request: Request) {
  const user = await requireAuth(request);
  return Response.json({ userId: user.id });
}
```

---

### Deploying to EAS Hosting

```bash
# Export web build
npx expo export -p web

# Deploy
npx eas-cli@latest deploy --prod

# Manage secrets
eas env:create --name OPENAI_API_KEY --value sk-xxx --environment production
```

PR preview URLs are generated automatically on every pull request — no extra config needed.

---

## Styling Pattern

Older web apps: CSS Modules alongside styled components.
Current preference: Tailwind CSS for web, StyleSheet for native.

No mixing Tailwind + inline styles in the same component. Pick one approach per component.
