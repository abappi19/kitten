---
title: Bappi's Storage Patterns
description: Storage layer decisions — SecureStore for tokens, MMKV for synchronous UI state (Zustand persist integration), AsyncStorageService singleton wrapper, storage key constants, and query cache persistence. What goes where and why.
type: reference
---

# Bappi's Storage Patterns

## What Goes Where

| Data | Storage | Why |
|------|---------|-----|
| JWT access token | `expo-secure-store` | Encrypted, OS-protected |
| Refresh token | `expo-secure-store` | Encrypted, OS-protected |
| User role / type | `expo-secure-store` | Determines routing — treat as auth |
| User info (non-sensitive) | `AsyncStorage` via `AsyncStorageService` | Serializable, non-secret |
| App preferences | `AsyncStorage` | Serializable, non-secret |
| Feature flags / sync UI state | `react-native-mmkv` | Synchronous reads, C++ speed |
| TanStack Query cache | `AsyncStorage` via persister | Serialized query state |
| Web tokens | `localStorage` | No SecureStore on web |

**Never:** tokens in AsyncStorage, credentials in Zustand, passwords anywhere client-side.

---

## TokenService (Static Class)

All token operations go through a static-only class. Never access SecureStore directly in service hooks.

```ts
import * as SecureStore from "expo-secure-store";
import { tokenKeys } from "@/lib/consts/token-keys.const";

class TokenService {
    private static TOKEN_KEY = tokenKeys.TOKEN_KEY;
    private static REFRESH_TOKEN_KEY = tokenKeys.REFRESH_TOKEN_KEY;

    static async setToken(token: string) {
        await SecureStore.setItemAsync(TokenService.TOKEN_KEY, token);
    }

    static async getToken(): Promise<string | null> {
        return await SecureStore.getItemAsync(TokenService.TOKEN_KEY);
    }

    static async setRefreshToken(token: string) {
        await SecureStore.setItemAsync(TokenService.REFRESH_TOKEN_KEY, token);
    }

    static async getRefreshToken(): Promise<string | null> {
        return await SecureStore.getItemAsync(TokenService.REFRESH_TOKEN_KEY);
    }

    static async clearTokens() {
        await SecureStore.deleteItemAsync(TokenService.TOKEN_KEY);
        await SecureStore.deleteItemAsync(TokenService.REFRESH_TOKEN_KEY);
    }
}

export default TokenService;
```

**Extended in some apps** to also store user type and user info:

```ts
static async setUserType(userType: string) {
    await SecureStore.setItemAsync(TokenService.USER_TYPE_KEY, userType);
}

static async getUserType(): Promise<string | null> {
    return await SecureStore.getItemAsync(TokenService.USER_TYPE_KEY);
}

static async setUserInfo(userInfo: string) {
    await SecureStore.setItemAsync(TokenService.USER_INFO_KEY, userInfo);
}

static async getUserInfo(): Promise<string | null> {
    return await SecureStore.getItemAsync(TokenService.USER_INFO_KEY);
}
```

---

## Cross-Platform Token Service

For apps that run on web (Next.js) and native (Expo), the TokenService branches on `isWeb`:

```ts
import { isWeb } from "tamagui"; // or Platform.OS === "web"

static async setToken(token: string) {
    if (isWeb) {
        globalThis?.localStorage?.setItem(TokenService.TOKEN_KEY, token);
        return;
    }
    await SecureStore.setItemAsync(TokenService.TOKEN_KEY, token);
}

static async getToken(): Promise<string | null> {
    if (isWeb) {
        return globalThis?.localStorage?.getItem(TokenService.TOKEN_KEY) || null;
    }
    return await SecureStore.getItemAsync(TokenService.TOKEN_KEY);
}
```

---

## Token Keys Constant

All storage keys are centralized:

```ts
export const tokenKeys = {
    TOKEN_KEY: "user_token",
    ACCESS_TOKEN_KEY: "access_token",
    REFRESH_TOKEN_KEY: "refresh_token",
    USER_TYPE_KEY: "user_type",
    USER_INFO_KEY: "user_info",
    MMKV_APP_STORAGE_KEY: "app-storage",
};
```

---

## AsyncStorageService (Singleton Wrapper)

AsyncStorage is never called directly. A class wrapper handles serialization and error swallowing:

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export class AsyncStorageService {
    async set<T>(key: string, value: T): Promise<void> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("AsyncStorage set error:", error);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await AsyncStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error("AsyncStorage get error:", error);
            return null;
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error("AsyncStorage delete error:", error);
        }
    }

    async clearAll(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error("AsyncStorage clearAll error:", error);
        }
    }
}

export const asyncStorage = new AsyncStorageService();
```

Usage:
```ts
await asyncStorage.set("user-preferences", { theme: "dark" });
const prefs = await asyncStorage.get<{ theme: string }>("user-preferences");
await asyncStorage.delete("user-preferences");
```

---

## Config Storage (Feature-Scoped)

Some projects add a feature-specific storage wrapper on top of AsyncStorageService:

```ts
import { asyncStorage } from "./async.storage";

export const configStorage = {
    async getLastSyncTime(): Promise<number | null> {
        return asyncStorage.get<number>("last-sync-time");
    },

    async setLastSyncTime(time: number): Promise<void> {
        return asyncStorage.set("last-sync-time", time);
    },
};
```

Keeps storage keys scoped to their domain.

---

## Query Persistence via AsyncStorage

TanStack Query cache is persisted using the `asyncStoragePersister`:

```ts
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export const asyncStoragePersister = createAsyncStoragePersister({
    storage: {
        getItem: async key => JSON.stringify(await asyncStorage.get(key)) || null,
        setItem: async (key, value) => asyncStorage.set(key, value),
        removeItem: async key => asyncStorage.delete(key),
    },
});
```

Filter what gets persisted — never persist sensitive queries:

```ts
persistQueryClient({
    queryClient,
    persister: asyncStoragePersister,
    dehydrateOptions: {
        shouldDehydrateQuery: query =>
            query.state.status === "success" && query.queryKey[0] !== "sensitive-data",
    },
});
```

---

## MMKV (Synchronous Key-Value)

`react-native-mmkv` is Bappi's preference over AsyncStorage for any data that needs synchronous reads — UI preferences, feature flags, non-sensitive app state. Faster than AsyncStorage because it runs on the C++ layer with no async overhead.

```ts
import { MMKV } from "react-native-mmkv";

export const appStorage = new MMKV({ id: "app-storage" });
```

Basic operations — synchronous, no `await`:

```ts
// Write
appStorage.set("theme", "dark");
appStorage.set("hasOnboarded", true);
appStorage.set("lastSyncTime", Date.now());

// Read
const theme = appStorage.getString("theme");            // string | undefined
const hasOnboarded = appStorage.getBoolean("hasOnboarded"); // boolean | undefined
const syncTime = appStorage.getNumber("lastSyncTime");  // number | undefined

// Delete
appStorage.delete("hasOnboarded");
```

### When to use MMKV

| Use case | Storage |
|----------|---------|
| UI theme / language preference | MMKV |
| Feature flags | MMKV |
| Has-seen-onboarding flag | MMKV |
| Non-sensitive app state (sync reads needed) | MMKV |
| JWT / refresh token | `expo-secure-store` — never MMKV |
| TanStack Query cache | AsyncStorage via persister |
| Sensitive user data | `expo-secure-store` |

### Zustand Persist with MMKV

```ts
import { MMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

const storage = new MMKV();

const zustandMmkvStorage: StateStorage = {
    setItem: (name, value) => storage.set(name, value),
    getItem: name => storage.getString(name) ?? null,
    removeItem: name => storage.delete(name),
};

export const useAppPreferencesStore = create<AppPreferencesStore>()(
    persist(
        set => ({
            theme: "dark",
            setTheme: theme => set({ theme }),
        }),
        {
            name: "app-preferences",
            storage: createJSONStorage(() => zustandMmkvStorage),
        }
    )
);
```

Synchronous reads mean the initial state is available immediately — no rehydration flash.

---

## BAD vs GOOD

```ts
// ❌ BAD — token stored in AsyncStorage (not encrypted)
await AsyncStorage.setItem("token", jwt);

// ✅ GOOD — token stored in SecureStore via TokenService
await TokenService.setToken(jwt);
```

```ts
// ❌ BAD — token in Zustand store
const { setToken } = useAuthStore();
setToken(response.auth.jwt); // will be in memory + possibly serialized

// ✅ GOOD — token only in SecureStore, never in state
await TokenService.setToken(response.auth.jwt);
```

```ts
// ❌ BAD — AsyncStorage called directly in a service hook
const token = await AsyncStorage.getItem("user_token");

// ✅ GOOD — goes through TokenService
const token = await TokenService.getToken();
```
