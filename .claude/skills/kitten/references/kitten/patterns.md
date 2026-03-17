# Bappi's Code Patterns
Real, production-ready code patterns the way Bappi writes them.

---

## Table of Contents
1. [custom fetch abstraction layer — Custom Fetch Abstraction Layer](#1-p04)
2. [refresh token pattern — Refresh Token Pattern](#2-p05)
3. [Zustand Store Pattern](#3-t12-store-pattern)
4. [TanStack Query Setup](#4-t13-setup)
5. [MMKV Persistent Storage](#5-t14-persistent-storage)
6. [feature-based folder structure Folder Structure](#6-p03-folder-structure)
7. [typed environment config — Environment Config](#7-p10)
8. [design tokens — Design Token System](#8-p06)
9. [XState for Complex UI](#9-t17-for-complex-ui)
10. [TypeScript Utility Patterns](#10-t26-utility-patterns)

---

## 1. custom fetch abstraction layer

Screens never touch transport details. All API calls go through this layer.

```typescript
// lib/api/client.ts
import axios, { AxiosInstance } from 'axios';
import { ENV } from '@/constants/env';
import { tokenStore } from '@/lib/auth/token-store';

const client: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    // refresh token pattern handled here — see below
    return Promise.reject(error);
  }
);

export { client };
```

```typescript
// lib/api/request.ts — the surface components actually call
import { client } from './client';
import type { AxiosRequestConfig } from 'axios';

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await client.get<T>(url, config);
  return response.data;
}

export async function post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
  const response = await client.post<T>(url, data, config);
  return response.data;
}

export async function put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
  const response = await client.put<T>(url, data, config);
  return response.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await client.delete<T>(url, config);
  return response.data;
}
```

---

## 2. refresh token pattern

Race-condition-safe. Multiple concurrent requests won't trigger multiple refreshes.

```typescript
// lib/auth/refresh.ts
import { client } from '@/lib/api/client';
import { tokenStore } from './token-store';

let refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  // If a refresh is already in flight, reuse it — don't fire a second one
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = tokenStore.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await client.post<{ access_token: string; refresh_token: string }>(
        '/auth/refresh',
        { refresh_token: refreshToken }
      );

      tokenStore.setTokens(data.access_token, data.refresh_token);
      return data.access_token;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
```

```typescript
// Plug into the axios interceptor in client.ts
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch {
        tokenStore.clearTokens();
        // navigate to login — use your navigation ref here
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 3. Zustand Store Pattern

Clean, typed, with devtools. One store per domain.

```typescript
// features/cart/store/cart.store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { storage } from '@/lib/storage/mmkv'; // MMKV-backed

type CartItem = { id: string; name: string; price: number; quantity: number };

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  total: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        addItem: (item) =>
          set((state) => {
            const existing = state.items.find((i) => i.id === item.id);
            if (existing) {
              return { items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              )};
            }
            return { items: [...state.items, { ...item, quantity: 1 }] };
          }, false, 'cart/addItem'),
        removeItem: (id) =>
          set((state) => ({ items: state.items.filter((i) => i.id !== id) }), false, 'cart/removeItem'),
        updateQuantity: (id, quantity) =>
          set((state) => ({
            items: quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
          }), false, 'cart/updateQuantity'),
        clear: () => set({ items: [] }, false, 'cart/clear'),
        total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      }),
      { name: 'cart-storage', storage } // MMKV-backed persist
    ),
    { name: 'CartStore' }
  )
);
```

---

## 4. TanStack Query Setup

```typescript
// lib/query/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      gcTime: 1000 * 60 * 10,    // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false;
        if (error?.response?.status === 404) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});
```

```typescript
// features/products/hooks/use-products.ts
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api/request'; // custom fetch abstraction layer
import type { Product } from '../types';

export const productKeys = {
  all: ['products'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.all, 'list', filters] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};

export function useProducts(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => get<Product[]>('/products', { params: filters }),
  });
}
```

---

## 5. MMKV Persistent Storage

```typescript
// lib/storage/mmkv.ts
import { MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const mmkv = new MMKV({ id: 'app-storage' });

// Zustand-compatible storage adapter
export const storage: StateStorage = {
  getItem: (key) => mmkv.getString(key) ?? null,
  setItem: (key, value) => mmkv.set(key, value),
  removeItem: (key) => mmkv.delete(key),
};

// Token store — used by refresh token pattern
export const tokenStore = {
  getAccessToken: () => mmkv.getString('access_token') ?? null,
  getRefreshToken: () => mmkv.getString('refresh_token') ?? null,
  setTokens: (access: string, refresh: string) => {
    mmkv.set('access_token', access);
    mmkv.set('refresh_token', refresh);
  },
  clearTokens: () => {
    mmkv.delete('access_token');
    mmkv.delete('refresh_token');
  },
};
```

---

## 6. feature-based folder structure Folder Structure

```
features/
  auth/
    components/
    hooks/           # useLogin, useLogout
    screens/         # LoginScreen, RegisterScreen
    store/           # Zustand store
    services/        # API calls via custom fetch abstraction layer
    types/
    schemas/         # Zod schemas
    index.ts         # barrel export (index.ts) — public barrel export

  products/
    components/
    hooks/
    screens/
    services/
    types/
    index.ts
```

**Rules:**
- Features import from each other only via barrel export (index.ts) barrel exports
- Shared code lives in `lib/` or root `components/`
- Never cross-import internal files from another feature

---

## 7. typed environment config

```typescript
// constants/env.ts
import Constants from 'expo-constants';
import { z } from 'zod'; // Zod

const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  APP_ENV: z.enum(['development', 'staging', 'production']),
  SENTRY_DSN: z.string().min(1),        // Sentry
  FIREBASE_API_KEY: z.string().min(1),  // Firebase Analytics
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

export const ENV = parseEnv(); // fail-fast — throws at startup if misconfigured
```

---

## 8. design tokens — Design Token System

```typescript
// constants/tokens.ts
export const Colors = {
  primary: '#6C63FF',
  primaryLight: '#9D97FF',
  secondary: '#FF6584',
  background: '#FFFFFF',
  backgroundDark: '#0F0F0F',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
} as const;

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
} as const;

export const Typography = {
  fontSizes: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30 },
  fontWeights: { regular: '400', medium: '500', semibold: '600', bold: '700' },
} as const;
```

---

## 9. XState for Complex UI

explicit state machine — replace boolean soup with explicit state machines.

```typescript
// features/checkout/machines/checkout.machine.ts
import { createMachine, assign } from 'xstate';

type CheckoutContext = {
  cart: CartItem[];
  address: Address | null;
  paymentMethod: PaymentMethod | null;
  orderId: string | null;
  error: string | null;
};

type CheckoutEvent =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SET_ADDRESS'; address: Address }
  | { type: 'SET_PAYMENT'; method: PaymentMethod }
  | { type: 'CONFIRM' }
  | { type: 'RETRY' };

export const checkoutMachine = createMachine<CheckoutContext, CheckoutEvent>({
  id: 'checkout',
  initial: 'address',
  states: {
    address: {
      on: {
        SET_ADDRESS: { actions: assign({ address: (_, e) => e.address }) },
        NEXT: { target: 'payment', guard: ({ context }) => !!context.address },
      },
    },
    payment: {
      on: {
        SET_PAYMENT: { actions: assign({ paymentMethod: (_, e) => e.method }) },
        NEXT: { target: 'review', guard: ({ context }) => !!context.paymentMethod },
        BACK: 'address',
      },
    },
    review: { on: { CONFIRM: 'submitting', BACK: 'payment' } },
    submitting: {
      invoke: {
        src: 'placeOrder',
        onDone: { target: 'success', actions: assign({ orderId: (_, e) => e.data.orderId }) },
        onError: { target: 'error', actions: assign({ error: (_, e) => e.data.message }) },
      },
    },
    success: { type: 'final' },
    error: { on: { RETRY: 'review' } },
  },
});
```

---

## 10. TypeScript Utility Patterns

```typescript
// lib/types/utils.ts

// Make specific keys required
type RequireFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Deep partial
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// Extract return type from async function
type ApiReturn<T extends (...args: any) => Promise<any>> = Awaited<ReturnType<T>>;

// Exhaustive switch — Design by Contract (DbC) in action
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

// Type-safe object keys
function typedKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}
```
