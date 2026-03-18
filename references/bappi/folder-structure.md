---
title: Bappi's Folder Structure Conventions
description: How Bappi organizes React Native and monorepo projects — lib-style standalone, Turborepo cross-platform, library-style, file suffix conventions, dependency boundaries, and barrel exports.
type: reference
when_to_load: When scaffolding a new project, discussing folder layout, reviewing project structure, or deciding where a new file belongs.
---

# Bappi's Folder Structure Conventions

## Standalone React Native App (Lib-Style)

The canonical standalone structure uses a `lib/` directory alongside `app/` (Expo Router). Routes are thin — all logic lives in `lib/`.

```
app/                        ← Expo Router routes only (thin wrappers)
  _layout.tsx               ← Root layout: fonts, providers, splash
  index.tsx                 ← Entry — redirects based on auth state
  [feature]/
    index.tsx               ← Route file — imports from lib/screens only
lib/
  components/               ← *.component.tsx — domain UI, no API calls
    [feature]/
    common/
  config/
    api/fetch-client.config.ts
    enums/
    env/env.config.ts
    token/config.token.ts
  consts/
    endpoints.const.ts
    query-keys.const.ts
    token-keys.const.ts
  containers/
    layout/layout.container.tsx
    providers/query.provider.tsx
  hooks/                    ← Cross-cutting hooks (device, updates, etc.)
  query/
    client.query.ts
    persister.query.ts
  screens/                  ← *.screen.tsx — route-level components
    [feature]/
  services/
    [feature]/
      [feature].schema.ts   ← Zod schemas + z.infer<> types
      [feature].store.ts    ← Zustand store
      use-[feature].service.ts ← TanStack Query hooks
  storage/
    async.storage.ts
    config.storage.ts
  styles/
    global.style.ts
    theme.style.ts
    variables.style.ts
  ui/                       ← *.ui.tsx — atomic primitives (Button, Text)
  utils/                    ← *.util.ts — pure functions
scripts/
  scaffold-module.mjs       ← Code generator: run once, never touch boilerplate again
docs/
  project-structure.md
  coding-standards.md
```

**Key rule:** `app/[feature]/index.tsx` contains zero logic. It imports only from `lib/screens/[feature]/[feature].screen.tsx`.

---

## Turborepo Monorepo (Cross-Platform)

Cross-platform products share screens and logic via a `packages/app` or `packages/config` package.

```
apps/
  [mobile-app]/             ← Expo RN app (thin — imports from packages/)
  [web-app]/                ← Next.js web app (thin — imports from packages/)
packages/
  app/                      ← Shared cross-platform screens and components
    __features/             ← Feature folders (some projects)
    components/             ← *.component.tsx
    components.common/      ← Shared across platforms
    components.web/         ← Web-only (*.web.tsx suffix)
    hooks/                  ← use-*.ts, use-*.web.ts
    native-services/        ← Native-only services
    provider/               ← React context providers
    ui/                     ← *.ui.tsx, *.ui.web.tsx
    web-services/           ← Web-only services
  config/                   ← Shared configuration package
    src/
      api/                  ← FetchClient, error-handler
      auth/                 ← token-management.ts, auth.provider.tsx
      constants/            ← endpoints.ts, query-keys.ts, token-keys.ts
      enums/
      env/                  ← native-env.ts, web-env.ts
      hooks/
      query/                ← query-client.ts, query-persister.ts
      services/             ← use-*.service.ts per feature
      storage/              ← [feature]/*.storage.ts
      themes/
      types/                ← *.type.ts
      validations/          ← *.validation.ts
  ui/                       ← Design system (Tamagui or custom)
  tailwind-config/
  typescript-config/
  fonts/
```

---

## Alternative: Library-Style (Some Standalone Apps)

Some apps use `library/` instead of `lib/`:

```
library/
  atom/                     ← Reusable UI atoms (AppButton, AppInput, etc.)
  constants/
    endpoint/endpoint.constant.ts
    env/env.constant.ts
    query/query.constant.ts
    token/token.constant.ts
  enums/
  functions/                ← Pure helpers
  queries/                  ← TanStack Query hooks
  repositories/
    api-client/api-client.ts ← Axios instance with token refresh
    [feature]/[feature].repository.ts ← Raw API calls (no React)
  schemas/                  ← Zod or TS types
  services/
    [feature]/[action]-[feature].service.ts ← Use-case hooks
  validations/              ← Zod schemas
components/
  [feature]/
app/                        ← Expo Router
```

---

## File Suffix Conventions

Every file communicates its role via suffix. This is non-negotiable.

| Suffix | Role |
|--------|------|
| `*.component.tsx` | Domain UI component — no direct API calls |
| `*.screen.tsx` | Full-screen layout, orchestrates hooks |
| `*.container.tsx` | Provider/layout wrapper that wires UI + state |
| `*.ui.tsx` | Atomic primitive (Button, Text, Input) |
| `*.ui.web.tsx` | Web-specific variant of a UI primitive |
| `*.service.ts` / `use-*.service.ts` | TanStack Query hooks (use-case layer) |
| `*.store.ts` | Zustand client state |
| `*.schema.ts` | Zod schemas + `z.infer<>` derived types |
| `*.const.ts` | Constants, never mutated |
| `*.util.ts` | Pure utility functions |
| `*.style.ts` | StyleSheet definitions |
| `*.type.ts` | TypeScript interfaces/types (when not in schema) |
| `*.repository.ts` | Raw API functions, no React |
| `*.validation.ts` | Zod validation (some projects, same as schema) |
| `*.entity.ts` | TypeScript entity shape (monorepo shared layer) |
| `*.enum.ts` | TypeScript enums |
| `*.gateway.ts` | NestJS HTTP controller (backend) |

---

## Dependency Boundaries

Direction: UI → Services → Infra. Never upstream.

| Layer | Can import | Cannot import |
|-------|-----------|---------------|
| `lib/ui` | Nothing | Services, config, query |
| `lib/components` | `lib/ui`, `lib/styles` | Services, config, network |
| `lib/screens` | `lib/hooks`, `lib/services`, `lib/components` | `lib/query`, `lib/config` directly |
| `lib/services` | `lib/config`, `lib/consts`, `lib/query` | Screen or component files |
| `lib/config`, `lib/query`, `lib/storage` | Pure TS/JS only | React imports |

If a cycle exists, extract the shared concern into `lib/utils` or a new slice.

---

## Barrel Exports

Each domain folder re-exports via `index.ts`:

```ts
// lib/services/auth/index.ts
export * from "./auth.schema";
export * from "./auth.store";
export * from "./use-auth.service";
```

All imports use the `@/` absolute alias (defined in `tsconfig.json`). Deep relative paths (`../../..`) are banned.

```ts
// ✅
import { useLogin } from "@/lib/services/auth";

// ❌
import { useLogin } from "../../../lib/services/auth/use-auth.service";
```

---

## Module Scaffold Script

New features are scaffolded — never typed from scratch:

```sh
bun run scaffold:module <feature-name>
```

Generates in one command:
- `lib/services/[feature]/[feature].schema.ts`
- `lib/services/[feature]/use-[feature].service.ts`
- `lib/components/[feature]/[feature].component.tsx`
- `lib/screens/[feature]/[feature].screen.tsx`
- `app/[feature]/index.tsx`

Skips existing files. PascalCase component names derived from kebab-case feature name.

---

## When to Create a New Folder

- Feature needs schema + hook + UI → dedicated slice under `lib/services/[feature]`
- Cross-cutting (device info, keyboard, analytics) → `lib/hooks`
- Pure functions with no deps → `lib/utils`
- Design tokens and colors → `lib/styles`
- Avoid mirroring platform names (`ios/`, `android/`) — Expo config handles native config
