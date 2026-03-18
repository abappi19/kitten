---
title: Bappi's Next.js & Web Patterns
description: Next.js ISR patterns, OTT web architecture, Tamagui cross-platform integration, Tailwind setup, syncpack/knip for monorepo health, and web-specific service patterns.
type: reference
when_to_load: When working on Next.js web apps, cross-platform Tamagui setups, or web-specific concerns in a monorepo.
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

## Styling Pattern

Older web apps: CSS Modules alongside styled components.
Current preference: Tailwind CSS for web, StyleSheet for native.

No mixing Tailwind + inline styles in the same component. Pick one approach per component.
