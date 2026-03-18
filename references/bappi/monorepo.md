---
title: Bappi's Monorepo Patterns
description: Turborepo setup, workspace structures, what belongs in packages/, inter-package dependencies, cross-platform code sharing, yarn/pnpm workspaces, and the shared config package pattern.
type: reference
---

# Bappi's Monorepo Patterns

## When to Use a Monorepo

- App ships on both mobile (RN/Expo) and web (Next.js) — share logic, not just types
- Multiple backend microservices that share DTOs, guards, and enums
- Design system needs to be shared across products

**Single app + single backend?** Stick to a standalone structure — monorepos add overhead.

---

## Turborepo Pipeline

```json
{
    "tasks": {
        "build": {
            "dependsOn": ["^build"],
            "outputs": [".next/**", "!.next/cache/**", "dist/**"]
        },
        "dev": {
            "cache": false,
            "persistent": true
        },
        "lint": {
            "dependsOn": ["^lint"]
        },
        "check-types": {
            "dependsOn": ["^check-types"],
            "inputs": ["**/*.{ts,tsx}"],
            "cache": false
        },
        "test": {
            "dependsOn": ["^build"],
            "inputs": ["**/*.{ts,tsx}", "**/*.test.{ts,tsx}"]
        }
    },
    "globalEnv": [
        "EXPO_PUBLIC_API_SERVER",
        "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY",
        "NEXT_PUBLIC_API_URL",
        "APP_ENV"
    ]
}
```

`globalEnv` — every env var used by any package must be listed here or Turbo won't invalidate the cache when it changes.

`^build` — build dependencies first. `dev` always has `cache: false`.

---

## Workspace Structures

### Cross-Platform (Expo + Next.js)

```
apps/
  mobile/                   ← Expo Router app (imports from packages/)
  web/                      ← Next.js app (imports from packages/)
packages/
  app/                      ← Shared screens, components, hooks
  config/                   ← Shared API client, query, auth, constants
  ui/                       ← Design system (Tamagui or custom)
  tailwind-config/          ← Tailwind preset exported for web
  typescript-config/        ← Shared tsconfig.json base
  fonts/                    ← Font files + generation scripts
```

### Native + Web (Full Shared Lib)

```
apps/
  native/                   ← Expo app
  web/                      ← Next.js app
packages/
  shared/
    src/
      library/
        apis/               ← Axios clients (one per microservice)
        atoms/              ← State (Recoil or Zustand)
        entities/           ← TypeScript entity types
        services/           ← React Query hooks
```

---

## What Goes in packages/

| Package | Contains |
|---------|---------|
| `app` | Shared screens, components, hooks, UI |
| `config` | FetchClient, QueryClient, auth provider, constants, validations, storage |
| `ui` | Design system components (Tamagui / custom) |
| `tailwind-config` | Tailwind preset, theme tokens |
| `typescript-config` | Shared `tsconfig.json` for path aliases and strict settings |
| `fonts` | Font files + build script |
| `testing` | Shared test helpers, fixtures, custom matchers |

---

## Shared Config Package

The `packages/config` pattern centralizes all infrastructure shared between apps:

```
packages/config/src/
  api/
    fetch-client.ts         ← FetchClient class
    error-handler.ts
  auth/
    token-management.ts     ← TokenService (branches native/web)
    auth.provider.tsx       ← AuthProvider context
  constants/
    endpoints.ts
    query-keys.ts
    token-keys.ts
  enums/
  env/
    native-env.ts           ← EXPO_PUBLIC_* vars
    web-env.ts              ← NEXT_PUBLIC_* vars
  hooks/
  query/
    query-client.ts         ← QueryClient + persistence
    query-persister.ts
  services/
    use-auth.service.ts
    use-[feature].service.ts
  storage/
    state-manager/
      [feature]/[feature].storage.ts
  themes/
  types/
    *.type.ts
  validations/
    *.validation.ts         ← Zod schemas
```

Apps import from this package:
```ts
import { fetchClient } from "@myapp/config/api";
import { useLogin } from "@myapp/config/services";
import { TokenService } from "@myapp/config/auth";
```

---

## Platform-Split Files

Files that differ between native and web use Expo's platform resolution:

```
components/
  button.ui.tsx             ← Native version (TouchableOpacity)
  button.ui.web.tsx         ← Web version (button element)
```

Expo automatically picks the right file. No runtime `Platform.OS` checks needed.

---

## Package.json for a Shared Package

```json
{
    "name": "@myapp/config",
    "main": "./src/index.ts",
    "exports": {
        ".": "./src/index.ts",
        "./api": "./src/api/index.ts",
        "./auth": "./src/auth/index.ts",
        "./services": "./src/services/index.ts"
    },
    "scripts": {
        "build": "tsc --project tsconfig.build.json",
        "check-types": "tsc --noEmit"
    },
    "dependencies": {
        "@tanstack/react-query": "^5.0.0",
        "zustand": "^5.0.0",
        "zod": "^4.0.0"
    }
}
```

---

## pnpm Workspace

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

Root `package.json` scripts for workspace-wide commands:
```json
"scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run check-types"
}
```

---

## Husky in Monorepo

Husky hooks live at the root. `pre-commit` runs `turbo run lint` which runs lint across all affected packages.

---

## Changesets in Monorepo

`.changeset/config.json`:
```json
{
    "changelog": ["@changesets/changelog-github", { "repo": "org/repo" }],
    "commit": false,
    "linked": [],
    "access": "restricted",
    "baseBranch": "main",
    "updateInternalDependencies": "patch"
}
```

---

## BAD vs GOOD

```ts
// ❌ BAD — each app has its own FetchClient implementation
// apps/mobile/lib/fetch-client.ts
// apps/web/lib/fetch-client.ts  ← duplicated, will diverge

// ✅ GOOD — single source in packages/config
// packages/config/src/api/fetch-client.ts
import { fetchClient } from "@myapp/config/api";
```

```ts
// ❌ BAD — Turbo pipeline doesn't declare env vars
// Turbo won't re-build when EXPO_PUBLIC_API_SERVER changes

// ✅ GOOD
// turbo.json
"globalEnv": ["EXPO_PUBLIC_API_SERVER", "NEXT_PUBLIC_API_URL"]
```
