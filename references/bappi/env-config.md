---
title: Bappi's Environment Config Patterns
description: How Bappi manages environment variables in Expo apps — getEnvVars() factory, EXPO_PUBLIC_ prefix, per-environment objects, app.config.ts runtime config, and the flat constants pattern for simpler apps.
type: reference
---

# Bappi's Environment Config Patterns

## Core Rule

**Never access `process.env.*` directly in components or service hooks.** All env reads go through a typed config function. This makes mocking in tests trivial and keeps the access surface in one place.

---

## getEnvVars Pattern (Canonical)

```ts
// lib/config/env/env.config.ts
import Constants from "expo-constants";

const ENV = {
    development: {
        API_URL: process.env.EXPO_PUBLIC_API_ENDPOINT_DEV,
        WEB_ORIGIN: process.env.EXPO_PUBLIC_WEB_ORIGIN,
    },
    production: {
        API_URL: process.env.EXPO_PUBLIC_API_ENDPOINT_PROD,
        WEB_ORIGIN: process.env.EXPO_PUBLIC_WEB_ORIGIN,
    },
};

const getEnvVars = (env = Constants.expoConfig?.extra?.environment) => {
    return env === "production" ? ENV.production : ENV.development;
};

export default getEnvVars;
```

Usage throughout the app:
```ts
import getEnvVars from "@/lib/config/env/env.config";

const { API_URL } = getEnvVars();
const fetchClient = new FetchClient(API_URL);
```

The `environment` field is set in `app.config.ts` and read at runtime from `Constants.expoConfig.extra`.

---

## app.config.ts: Runtime Environment Injection

```ts
// app.config.ts
module.exports = ({ config }) => ({
    ...config,
    extra: {
        eas: { projectId: process.env.EAS_PROJECT_ID },
        environment: process.env.APP_ENV || "development",
    },
    runtimeVersion: { policy: "appVersion" },
    updates: {
        url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID}`,
    },
    ios: {
        bundleIdentifier: "com.mycompany.myapp",
        usesAppleSignIn: true,
        config: {
            googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
        },
    },
    android: {
        edgeToEdgeEnabled: true,
        config: {
            googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY },
        },
    },
    plugins: [
        "expo-font",
        "expo-secure-store",
        ["expo-updates", { username: "mycompany-slug" }],
        ["expo-build-properties", { ios: { deploymentTarget: "15.1", useFrameworks: "static" } }],
    ],
});
```

---

## EAS Build Profiles + env

```json
{
    "build": {
        "base": {
            "node": ">=24.11.0",
            "bun": ">=1.2.9",
            "env": {
                "APP_ENV": "development"
            }
        },
        "development": {
            "extends": "base",
            "developmentClient": true,
            "distribution": "internal",
            "android": { "buildType": "apk", "withoutCredentials": true },
            "ios": { "simulator": true }
        },
        "preview": {
            "extends": "base",
            "env": { "APP_ENV": "staging" },
            "android": { "distribution": "internal", "buildType": "apk" }
        },
        "production": {
            "extends": "base",
            "env": { "APP_ENV": "production" },
            "autoIncrement": true,
            "appVersionSource": "remote"
        }
    }
}
```

`appVersionSource: "remote"` — EAS controls the version, not `package.json`.

---

## .env.example Pattern

```
EXPO_PUBLIC_API_ENDPOINT_DEV=https://dev-api.example.com
EXPO_PUBLIC_API_ENDPOINT_PROD=https://api.example.com
EXPO_PUBLIC_WEB_ORIGIN=https://example.com
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
EXPO_PUBLIC_ABLY_KEY=your_key_here
EXPO_PUBLIC_SOCKET_URL=wss://socket.example.com
EXPO_PUBLIC_AWS_BASE_URL=https://s3.amazonaws.com/mybucket
EAS_PROJECT_ID=your-eas-project-id
APP_ENV=development
```

`EXPO_PUBLIC_*` prefix exposes the var to the client bundle. Non-prefixed vars stay server-side (used in app.config.ts only).

---

## Flat Constants Pattern (Simpler Apps)

Some apps skip the factory and use a flat export:

```ts
export const AppEnvConstant = {
    API_SERVER: process.env.EXPO_PUBLIC_API_SERVER,
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    ABLY_KEY: process.env.EXPO_PUBLIC_ABLY_KEY,
    SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL,
    AWS_BASE_URL: process.env.EXPO_PUBLIC_AWS_BASE_URL,
};
```

Still centralized — never read `process.env` in a component.

---

## Native vs Web Env Split (Monorepo)

Cross-platform projects maintain separate env configs per platform:

```
packages/config/src/env/
  native-env.ts   ← EXPO_PUBLIC_* vars
  web-env.ts      ← NEXT_PUBLIC_* vars
```

---

## Turbo Global Env (Monorepo)

In `turbo.json`, all env vars must be declared or the cache is not invalidated on change:

```json
{
    "globalEnv": [
        "EXPO_PUBLIC_API_SERVER",
        "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY",
        "NEXT_PUBLIC_API_URL",
        "APP_ENV"
    ]
}
```

---

## BAD vs GOOD

```ts
// ❌ BAD — direct env access in a service hook
const BASE_URL = process.env.EXPO_PUBLIC_API_ENDPOINT_DEV;
const fetchClient = new FetchClient(BASE_URL);

// ✅ GOOD — accessed through the config function
const { API_URL } = getEnvVars();
const fetchClient = new FetchClient(API_URL);
```

```ts
// ❌ BAD — hardcoded URL in production code
fetchClient.get("https://api.myapp.com/auth/login");

// ✅ GOOD
fetchClient.get(Endpoints.auth.login);
```
