# Bappi's Architecture Patterns
---

## Table of Contents
1. [feature-based folder structure — Feature-Based Folder Structure](#1-p03)
2. [Lib-Style Monolithic Structure](#2-lib-style-monolithic-structure)
3. [monorepo — Turborepo Monorepo](#3-p09)
4. [design tokens Architecture](#4-p06-architecture)
5. [typed environment config — Environment Configuration](#5-p10)
6. [Cross-Platform Web + React Native](#6-cross-platform)
7. [API layer separation — API Layer Separation](#7-p16)

---

## 1. feature-based folder structure

Bappi's default for new projects. Everything related to a domain lives together.

```
src/
├── features/
│   ├── auth/
│   │   ├── components/        # UI components (LoginForm, OTPInput)
│   │   ├── hooks/             # useLogin, useLogout, useCurrentUser
│   │   ├── screens/           # LoginScreen, RegisterScreen
│   │   ├── store/             # auth.store.ts (Zustand)
│   │   ├── services/          # auth.service.ts (API calls via lib/api)
│   │   ├── schemas/           # Zod schemas
│   │   ├── types/             # auth.types.ts
│   │   └── index.ts           # barrel export (index.ts) — only import from here
│   │
│   ├── products/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── cart/
│       ├── components/
│       ├── hooks/
│       ├── screens/
│       ├── store/
│       ├── types/
│       └── index.ts
│
├── lib/                       # Shared infrastructure
│   ├── api/                   # client.ts, request.ts (custom fetch abstraction layer)
│   ├── auth/                  # token-store.ts, refresh.ts (refresh token pattern)
│   ├── query/                 # queryClient.ts (TanStack Query config)
│   ├── storage/               # mmkv.ts (MMKV)
│   └── types/                 # Shared utility types
│
├── components/                # Truly shared UI (Button, Input, Modal)
├── navigation/                # Root navigator, stack definitions (React Navigation)
├── constants/                 # env.ts (typed environment config), tokens.ts (design tokens)
└── app.tsx
```

**Rules Bappi enforces:**
- Features only import from each other via barrel export (index.ts) — never internal files
- `lib/` is infrastructure, not business logic
- `components/` at root is for UI primitives used by 3+ features
- Navigation lives in `navigation/` — never inside a feature

---

## 2. Lib-Style Monolithic Structure

For larger, established codebases or teams used to a Rails-style organization.

```
lib/
├── services/
├── schemas/
├── components/
├── screens/
├── validations/
└── constants/
```

When to use:
- **feature-based folder structure** → new projects, small-to-mid teams, clear domain boundaries
- **Lib-style** → joining an existing codebase already organized this way, or very large teams where cross-cutting concerns dominate

---

## 3. monorepo

For cross-platform projects sharing Next.js and Expo under one repo using Turborepo.

```
apps/
├── mobile/            # Expo React Native app
├── web/               # Next.js app
└── api/               # Hono.js or Next.js API (optional)

packages/
├── ui/                # Shared design system components
├── config/            # Shared tooling configs (ESLint, TypeScript, Tailwind CSS)
├── types/             # Shared TypeScript types
└── utils/             # Pure utility functions

turbo.json
package.json           # workspace root
```

**turbo.json (key pipelines):**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "test": { "outputs": ["coverage/**"] },
    "type-check": { "dependsOn": ["^build"] }
  }
}
```

---

## 4. design tokens Architecture

Centralized tokens shared across web and React Native. No raw values scattered through components.

```typescript
// packages/config/tokens/index.ts
export const tokens = {
  color: {
    brand: { primary: '#6C63FF', primaryLight: '#9D97FF', secondary: '#FF6584' },
    neutral: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 700: '#374151', 900: '#111827' },
    semantic: { error: '#EF4444', success: '#10B981', warning: '#F59E0B', info: '#3B82F6' },
  },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 },
  radius: { sm: 4, md: 8, lg: 12, xl: 16, '2xl': 24, full: 9999 },
  fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30 },
} as const;
```

**Dark mode pattern — cross-platform design token sharing between React Native and Next.js:**
```typescript
export const lightTheme = {
  background: tokens.color.neutral[50],
  surface: '#FFFFFF',
  text: tokens.color.neutral[900],
  border: tokens.color.neutral[200],
  primary: tokens.color.brand.primary,
} as const;

export type Theme = typeof lightTheme;

export const darkTheme: Theme = {
  background: '#0F0F0F',
  surface: '#1A1A1A',
  text: tokens.color.neutral[50],
  border: '#2A2A2A',
  primary: tokens.color.brand.primaryLight,
} as const;
```

---

## 5. typed environment config

Typed, validated, fail-fast. No raw `process.env` calls scattered everywhere.

```typescript
// apps/mobile/constants/env.ts
import Constants from 'expo-constants';
import { z } from 'zod'; // Zod

const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  APP_ENV: z.enum(['development', 'staging', 'production']),
  SENTRY_DSN: z.string().min(1),   // Sentry
  FIREBASE_API_KEY: z.string().min(1), // Firebase Analytics
});

function parseEnv() {
  const result = envSchema.safeParse(Constants.expoConfig?.extra);
  if (!result.success) {
    throw new Error(
      `Invalid environment configuration:\n${result.error.issues
        .map((i) => `  ${i.path}: ${i.message}`)
        .join('\n')}`
    );
  }
  return result.data;
}

export const ENV = parseEnv();
```

---

## 6. Cross-Platform

Bappi's approach to sharing logic between Next.js and Expo without breaking platform boundaries.

**Sharing business logic (monorepo packages):**
```typescript
// packages/utils/src/format.ts — pure functions, no platform imports
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
```

**Platform-specific UI — cross-platform design token sharing:**
```
packages/ui/src/
├── Button/
│   ├── Button.tsx         # Shared props interface + logic
│   ├── Button.native.tsx  # React Native implementation
│   ├── Button.web.tsx     # Next.js implementation
│   └── index.ts
```

Metro and Next.js automatically resolve `.native.tsx` vs `.web.tsx` extensions.

---

## 7. API layer separation

How Bappi layers the API system — from transport to component.

```
Transport (Axios)
    ↓
client.ts — base instance, interceptors, token injection
    ↓
request.ts — typed get/post/put/delete wrappers (custom fetch abstraction layer)
    ↓
feature/services/*.service.ts — domain-specific API calls
    ↓
feature/hooks/use-*.ts — TanStack Query hooks
    ↓
feature/screens/*.tsx — components call hooks, never services directly
```

Components never skip layers. A screen never calls a service directly. A hook never uses Axios directly — it goes through `request.ts`. This makes testing, mocking (msw), and refactoring dramatically easier.
