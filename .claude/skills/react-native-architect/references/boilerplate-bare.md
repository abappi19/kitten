# Bare React Native Boilerplate Templates

Use these exact file contents when scaffolding a new bare React Native project.

---

## `src/app/index.tsx`

App entry point — wraps everything in providers.

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RootNavigator } from '../navigation/RootNavigator'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
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

---

## `src/navigation/RootNavigator.tsx`

Root navigator with auth-aware routing.

```tsx
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  // Replace with your auth store selector
  // const user = useAuthStore((s) => s.user)

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Swap between auth and main navigator based on auth state */}
        {/* {user ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )} */}
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

// Temporary placeholder — replace after creating screens
function HomeScreen() {
  const { View, Text } = require('react-native')
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home</Text>
    </View>
  )
}
```

---

## `src/navigation/types.ts`

Type-safe route params.

```ts
export type RootStackParamList = {
  Home: undefined
  Detail: { id: string }
  Profile: { userId: string; edit?: boolean }
}

// Extend as you add screens
```

---

## `src/services/api.ts`

Axios instance with auth token injection.

```ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  // Import your auth store here and attach the token
  // const token = useAuthStore.getState().token
  // if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized — clear auth store, navigate to login
    }
    return Promise.reject(error)
  }
)
```

---

## `src/services/storage.ts`

MMKV wrapper with typed keys.

```ts
import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV()

export const StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
} as const

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys]
```

---

## Feature Template

When scaffolding a feature (e.g. `products`), create these files:

### `src/features/[name]/store/[name]Store.ts`

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

### `src/features/[name]/api/use[Name].ts`

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../services/api'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products'),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductDto) => api.post('/products', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}
```

### `src/features/[name]/screens/[Name]Screen.tsx`

```tsx
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/types'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export function ProductsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text>Products</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
})
```

### `src/features/[name]/types.ts`

```ts
export interface Product {
  id: string
  name: string
  price: number
  createdAt: string
}

export interface CreateProductDto {
  name: string
  price: number
}
```

---

## `src/features/auth/store/authStore.ts`

Auth store template — replace with your actual user type.

```ts
import { create } from 'zustand'
import { storage, StorageKeys } from '../../../services/storage'

interface User {
  id: string
  email: string
  name: string
}

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

---

## `.env` Template

Create `.env` at the project root:

```
API_URL=https://api.yourapp.com
```

And `.env.example` with the same keys but no values.

Install `react-native-config` to load env vars:

```bash
npm install react-native-config
cd ios && pod install
```
