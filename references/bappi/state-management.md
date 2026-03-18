---
title: Bappi's State Management (Zustand)
description: Zustand store patterns — typed interface, persist middleware, non-persisted flow state, outside-React access, and the hard separation between client state (Zustand) and server state (TanStack Query).
type: reference
when_to_load: When designing or reviewing state management — stores, persistence, auth state, flow state, or anything involving Zustand.
---

# Bappi's State Management (Zustand)

## Core Rule

**Zustand = client state only.** TanStack Query owns server state (data from APIs). Never put API responses directly into Zustand — let the query cache handle them. Zustand holds user auth info, UI state, and ephemeral flow state (OTP steps, wizard progress).

---

## Basic Store Pattern

Every store is typed with an explicit interface. State + actions together in one object.

```ts
interface MyFeatureStore {
    data: MyType | null;
    setData: (data: MyType | null) => void;
}

export const useMyFeatureStore = create<MyFeatureStore>()(set => ({
    data: null,
    setData: data => set({ data }),
}));
```

---

## Persisted Store (Auth User)

User identity is persisted to AsyncStorage so it survives app restarts:

```ts
interface AuthUserStore {
    user: User | null;
    setUser: (user: User | null) => void;
}

export const useAuthUserStore = create<AuthUserStore>()(
    persist(
        set => ({
            user: null,
            setUser: (user: User | null) => set({ user }),
        }),
        {
            name: "auth-user",                              // AsyncStorage key
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
```

**Note:** Only non-sensitive user info goes here. Tokens always go to `expo-secure-store` via `TokenService` — never into Zustand or AsyncStorage directly.

---

## Non-Persisted Flow State

Ephemeral multi-step flows (forgot password, OTP, wizards) use a plain store without persist:

```ts
interface AuthForgotPasswordStore {
    email: string | null;
    token: string | null;
    otp: string | null;
    setEmail: (email: string | null) => void;
    setToken: (token: string | null) => void;
    setOtp: (otp: string | null) => void;
}

export const useAuthForgotPasswordStore = create<AuthForgotPasswordStore>()(set => ({
    email: null,
    token: null,
    otp: null,
    setEmail: email => set({ email }),
    setToken: token => set({ token }),
    setOtp: otp => set({ otp }),
}));
```

This store is cleared on logout. No persist — flow restarts cleanly if the app is closed.

---

## Accessing Stores Outside React

Zustand stores are accessible outside component trees via `.getState()` and `.setState()`. Used in the FetchClient to clear auth state on refresh failure:

```ts
// In FetchClient — not a React component
authUserStore.setState({ user: null });
```

This avoids prop drilling auth state down to the network layer.

---

## Multiple Stores Per Feature

Complex features split their state:

```ts
// Persistent — survives restarts
export const useAuthUserStore = create<AuthUserStore>()(persist(...));

// Ephemeral — reset on logout
export const useAuthForgotPasswordStore = create<AuthForgotPasswordStore>()(set => ({ ... }));
```

One store for identity (persisted), one for flow state (in-memory).

---

## Zustand vs TanStack Query — Decision Table

| Data | Use |
|------|-----|
| Server data (API responses, lists, details) | TanStack Query |
| Authenticated user identity | Zustand (persisted) |
| Multi-step form/wizard state | Zustand (non-persisted) |
| Navigation-driven UI state | Zustand or local state |
| Toast/modal open state | Local `useState` |
| User preferences from API | TanStack Query |

---

## BAD vs GOOD

```ts
// ❌ BAD — storing API response in Zustand, bypassing the query cache
const { setProducts } = useProductStore();
const { data } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
useEffect(() => { setProducts(data); }, [data]);

// ✅ GOOD — TanStack Query owns the data
const { data: products } = useQuery({
    queryKey: queryKeys.products.list(),
    queryFn: () => fetchClient.get(Endpoints.products.list),
});
```

```ts
// ❌ BAD — storing token in Zustand
const { setToken } = useAuthStore();
setToken(response.auth.jwt); // persisted to AsyncStorage — not secure

// ✅ GOOD — tokens always go to SecureStore
await TokenService.setToken(response.auth.jwt);
```
