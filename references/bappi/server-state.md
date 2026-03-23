---
title: Bappi's Server State (TanStack Query)
description: QueryClient config, query persistence, query key factories, useQuery/useMutation patterns, cache manipulation, and cross-platform persistence. Everything Bappi does with TanStack Query v5.
type: reference
---

# Bappi's Server State (TanStack Query)

## QueryClient Config

```ts
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60,     // 1 hour — keep in memory
            staleTime: 1000 * 60 * 30,  // 30 min — serve cached data
            retry: 3,
            networkMode: "online",
        },
    },
});
```

Boilerplate starts with `staleTime: 0, gcTime: 0` (disabled by default) and each feature overrides per its needs.

---

## Query Persistence (AsyncStorage)

Queries are persisted across app restarts. The persister wraps `AsyncStorageService`:

```ts
export const asyncStoragePersister = createAsyncStoragePersister({
    storage: {
        getItem: async key => JSON.stringify(await asyncStorage.get(key)) || null,
        setItem: async (key, value) => asyncStorage.set(key, value),
        removeItem: async key => asyncStorage.delete(key),
    },
});

persistQueryClient({
    queryClient,
    persister: asyncStoragePersister,
    dehydrateOptions: {
        shouldDehydrateQuery: query =>
            query.state.status === "success" && query.queryKey[0] !== "sensitive-data",
    },
});
```

Provider wraps the app:

```tsx
<PersistQueryClientProvider
    client={queryClient}
    persistOptions={{ persister: asyncStoragePersister }}
>
    {children}
</PersistQueryClientProvider>
```

Cross-platform: `localStoragePersister` on web, `asyncStoragePersister` on native.

---

## Query Key Factories

All query keys live in a typed constant object — never inline strings:

```ts
export const queryKeys = {
    user: {
        getUserInfo: (id: string) => ["user", "getUserInfo", id] as const,
        getPreferences: (id: string) => ["user", "getPreferences", id] as const,
    },
    myFeature: {
        list: () => ["myFeature", "list"] as const,
        detail: (id: string) => ["myFeature", "detail", id] as const,
    },
};
```

**Why:** consistent invalidation, no typos, easy refactoring.

---

## useQuery Pattern (Service Hook)

Each feature has a `use-[feature].service.ts` that wraps `useQuery`:

```ts
export function useMyFeatureList() {
    return useQuery<MyFeature[]>({
        queryKey: queryKeys.myFeature.list(),
        queryFn: () => fetchClient.get(Endpoints.myFeature.list),
    });
}
```

With staleTime override for long-lived data:

```ts
export const useUserPreferences = <TResponse = { id: string }[], TError = Error>(
    options?: Omit<UseQueryOptions<TResponse, TError>, "queryKey" | "queryFn">
) => {
    const { user } = useAuthUserStore();
    return useQuery({
        queryKey: queryKeys.user.getPreferences(user?.id || ""),
        queryFn: () => fetchClient.get(Endpoints.auth["save-device-info"]),
        staleTime: 1000 * 60 * 60 * 24,
        gcTime: 1000 * 60 * 60 * 24,
        ...options,  // caller can override
    });
};
```

---

## useMutation Pattern

Full auth mutation showing the canonical flow:

```ts
export function useLogin() {
    const queryClient = useQueryClient();
    const { setUser } = useAuthUserStore();

    return useMutation<LoginResponse, Error, LoginPayload>({
        mutationFn: async payload => {
            return await fetchClient.post(Endpoints.auth.login, payload, { skipAuthorization: true });
        },
        onSuccess: async data => {
            await TokenService.setToken(data.auth.jwt);
            await TokenService.setRefreshToken(data.auth.refreshToken);
            queryClient.setQueryData(["user", data.user.id], data.user);
            setUser(data.user);
            showMessage({ message: "Welcome back!", type: "success" });
            router.replace("/");
        },
        onError: error => {
            showMessage({ message: error?.message || "Something went wrong", type: "danger" });
            console.error("Login error:", error);
        },
    });
}
```

**Always in `onSuccess`:** set token → set user → update cache → navigate
**Always in `onError`:** show flash message → log error

---

## TanStack Query v5 Notes

- Use `isPending` not `isLoading` for mutations
- `mutateAsync` for await-able mutations (e.g., `await getCurrentUser(token)` inside another mutation's onSuccess)
- `mutate` for fire-and-forget
- `useQueryClient()` to access the client inside hooks

---

## Cache Manipulation After Mutations

Update the cache directly after a mutation to avoid a refetch:

```ts
// Set a single item
queryClient.setQueryData(["user", data.user.id], data.user);

// Update an item inside an infinite query list
queryClient.setQueryData(
    queryKeys.myFeature.list(),
    (prev: MyFeaturePage[]) => ({
        ...prev,
        pages: prev?.pages?.map(page => ({
            ...page,
            data: page.data.map(item => item.id === updated.id ? updated : item),
        })) || [],
    }),
);

// Invalidate (triggers refetch)
queryClient.invalidateQueries({ queryKey: ["user"] });

// Refetch immediately
queryClient.refetchQueries({ queryKey: queryKeys.myFeature.list(), exact: false });
```

---

## useInfiniteQuery (Paginated Lists)

Used for content feeds, search results, and any list that loads more on scroll.

```ts
export function useMyFeatureFeed() {
    return useInfiniteQuery({
        queryKey: queryKeys.myFeature.feed(),
        queryFn: ({ pageParam = 1 }) =>
            fetchClient.get<MyFeaturePage>(`${Endpoints.myFeature.feed}?page=${pageParam}`),
        initialPageParam: 1,
        getNextPageParam: lastPage => lastPage.nextPage ?? undefined,
    });
}
```

`getNextPageParam` returns `undefined` when there are no more pages — TanStack Query sets `hasNextPage: false` automatically.

### FlashList Integration

Flatten `pages` before passing to `FlashList`:

```ts
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useMyFeatureFeed();

const items = useMemo(
    () => data?.pages.flatMap(page => page.data) ?? [],
    [data]
);

<FlashList
    data={items}
    renderItem={({ item }) => <ItemCard item={item} />}
    estimatedItemSize={80}
    onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
    onEndReachedThreshold={0.5}
    ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
/>
```

### Cache Update for Infinite Queries

```ts
queryClient.setQueryData(
    queryKeys.myFeature.feed(),
    (prev: InfiniteData<MyFeaturePage> | undefined) => {
        if (!prev) return prev;
        return {
            ...prev,
            pages: prev.pages.map(page => ({
                ...page,
                data: page.data.map(item =>
                    item.id === updated.id ? updated : item
                ),
            })),
        };
    }
);
```

### Expected Page Shape

```ts
interface MyFeaturePage {
    data: MyFeatureItem[];
    nextPage: number | null;  // null signals end of list
    total: number;
}
```

---

## Provider Ordering

`QueryClientProvider` (or `PersistQueryClientProvider`) must wrap every component that calls a TanStack Query hook — including content rendered inside portal-based providers.

### Portal providers are the main trap

`BottomSheetModalProvider` portals its modal content to where **it** sits in the tree. If `BottomSheetModalProvider` sits above `QueryClientProvider`, any `useQuery` inside a bottom sheet modal throws:

> `No QueryClient set, use QueryClientProvider to set one`

Fix: move `BottomSheetModalProvider` inside `QueryClientProvider`.

```tsx
// ❌ BottomSheetModalProvider above QueryClientProvider
// useQuery inside any bottom sheet modal → crash
<BottomSheetModalProvider>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
</BottomSheetModalProvider>

// ✅ BottomSheetModalProvider inside QueryClientProvider
// bottom sheet content inherits the QueryClient correctly
<QueryClientProvider client={queryClient}>
  <BottomSheetModalProvider>
    <App />
  </BottomSheetModalProvider>
</QueryClientProvider>
```

**General rule:** any portal-based provider (`BottomSheetModalProvider`, custom portals, modals) must sit **inside** every context provider its children need — theme, QueryClient, auth, etc. Portals don't escape the React context tree; they render at the provider's position.

---

## BAD vs GOOD

```ts
// ❌ BAD — inline query key string
useQuery({ queryKey: ["products", "list"], queryFn: ... })

// ✅ GOOD — factory from queryKeys constant
useQuery({ queryKey: queryKeys.products.list(), queryFn: ... })
```

```ts
// ❌ BAD — screen fetches directly without service hook
const { data } = useQuery({ queryKey: ["profile"], queryFn: () => fetch("/profile") });

// ✅ GOOD — screen uses the service hook
const { data } = useUserProfile();
```

```ts
// ❌ BAD — using isLoading (TanStack Query v5 deprecated it on mutations)
const { mutate, isLoading } = useMutation(...)

// ✅ GOOD
const { mutate, isPending } = useMutation(...)
```

```tsx
// ❌ BAD — BottomSheetModalProvider above QueryClientProvider
// any useQuery inside a bottom sheet modal → "No QueryClient set"
<BottomSheetModalProvider>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
</BottomSheetModalProvider>

// ✅ GOOD — BottomSheetModalProvider inside QueryClientProvider
<QueryClientProvider client={queryClient}>
  <BottomSheetModalProvider>
    <App />
  </BottomSheetModalProvider>
</QueryClientProvider>
```
