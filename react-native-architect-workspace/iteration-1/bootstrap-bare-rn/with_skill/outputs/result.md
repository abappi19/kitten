# ShopApp — Bare React Native Scaffold (with skill)

**Prompt:** Create a new React Native app called ShopApp — it's an e-commerce app for browsing and buying products. Use bare RN (not Expo). Scaffold auth, products, and cart.

---

## Step 1 — Check latest React Native version

```bash
npm view react-native version
```

> Use the result to confirm we're bootstrapping with the latest version.

---

## Step 2 — Bootstrap

```bash
npx react-native@latest init ShopApp --template react-native-template-typescript
```

---

## Step 3 — Install the stack

```bash
npm install @react-navigation/native @react-navigation/native-stack \
  react-native-screens react-native-safe-area-context \
  zustand @tanstack/react-query axios react-hook-form zod @hookform/resolvers \
  react-native-mmkv

cd ios && pod install && cd ..
```

---

## Step 4 — Folder structure created

```
src/
├── app/
│   └── index.tsx
├── features/
│   ├── auth/
│   │   ├── api/useAuth.ts
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── screens/LoginScreen.tsx
│   │   ├── store/authStore.ts
│   │   └── types.ts
│   ├── products/
│   │   ├── api/useProducts.ts
│   │   ├── components/ProductCard.tsx
│   │   ├── hooks/
│   │   ├── screens/ProductsScreen.tsx
│   │   ├── store/productsStore.ts
│   │   └── types.ts
│   └── cart/
│       ├── api/useCart.ts
│       ├── components/CartItem.tsx
│       ├── hooks/
│       ├── screens/CartScreen.tsx
│       ├── store/cartStore.ts
│       └── types.ts
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   └── types/
├── navigation/
│   ├── RootNavigator.tsx
│   └── types.ts
└── services/
    ├── api.ts
    └── storage.ts
```

---

## Step 5 — Boilerplate files

### `src/app/index.tsx`
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RootNavigator } from '../navigation/RootNavigator'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  )
}
```

### `src/navigation/types.ts`
```ts
export type RootStackParamList = {
  Login: undefined
  Main: undefined
  Products: undefined
  ProductDetail: { id: string }
  Cart: undefined
}
```

### `src/navigation/RootNavigator.tsx`
```tsx
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore } from '../features/auth/store/authStore'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  const user = useAuthStore((s) => s.user)

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Products" component={ProductsScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

// Placeholder imports — replace after creating screen files
function ProductsScreen() { return null }
function CartScreen() { return null }
function LoginScreen() { return null }
```

### `src/services/api.ts`
```ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  // const token = useAuthStore.getState().token
  // if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // clear auth, navigate to login
    }
    return Promise.reject(error)
  }
)
```

### `src/services/storage.ts`
```ts
import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

export const StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
} as const
```

### `src/features/auth/store/authStore.ts`
```ts
import { create } from 'zustand'
import { storage, StorageKeys } from '../../../services/storage'

interface User { id: string; email: string; name: string }

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: storage.getString(StorageKeys.AUTH_TOKEN) ?? null,
  setAuth: (user, token) => {
    storage.set(StorageKeys.AUTH_TOKEN, token)
    set({ user, token })
  },
  logout: () => {
    storage.delete(StorageKeys.AUTH_TOKEN)
    set({ user: null, token: null })
  },
}))
```

### `src/features/auth/types.ts`
```ts
export interface User { id: string; email: string; name: string }
export interface LoginDto { email: string; password: string }
export interface AuthResponse { user: User; token: string }
```

### `src/features/products/store/productsStore.ts`
```ts
import { create } from 'zustand'

interface ProductsState {
  selectedId: string | null
  setSelectedId: (id: string | null) => void
}

export const useProductsStore = create<ProductsState>((set) => ({
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
}))
```

### `src/features/products/api/useProducts.ts`
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'
import type { Product, CreateProductDto } from '../types'

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => api.get('/products'),
  })
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ['products', id],
    queryFn: () => api.get(`/products/${id}`),
  })
}
```

### `src/features/products/types.ts`
```ts
export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  stock: number
}
```

### `src/features/cart/store/cartStore.ts`
```ts
import { create } from 'zustand'
import type { CartItem } from '../types'

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId)
      if (existing) {
        return { items: state.items.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i) }
      }
      return { items: [...state.items, item] }
    }),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))
```

### `src/features/cart/types.ts`
```ts
export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}
```

---

## Step 6 — Summary

**Files created:** 18+ files, 3 features scaffolded (auth, products, cart)

**Run the app:**
```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

**Next steps:**
1. Set `API_URL` in `.env` via `react-native-config`
2. Replace placeholder screen imports in `RootNavigator.tsx`
3. Build out `ProductsScreen` using `useProducts()`
4. Build out `CartScreen` using `useCartStore()`
