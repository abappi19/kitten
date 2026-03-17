# Expo Boilerplate Templates

Use these exact file contents when scaffolding a new Expo project.

---

## `app/_layout.tsx`

Root layout that wraps the entire app in providers.

```tsx
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
})

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  )
}
```

---

## `app/index.tsx`

Home screen entry point.

```tsx
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
})
```

---

## `app/(auth)/login.tsx`

Login screen with React Hook Form + Zod.

```tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => {
    console.log(data)
    // Call your auth store action here
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Password"
            onChangeText={onChange}
            value={value}
            secureTextEntry
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  error: { color: '#ef4444', fontSize: 13, marginBottom: 8 },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
```

---

## `src/services/api.ts`

Axios instance with auth token injection.

```ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
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
      // Handle unauthorized — clear auth store, redirect to login
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

export function ProductsScreen() {
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

## `.env` Template

Create `.env` at the project root:

```
EXPO_PUBLIC_API_URL=https://api.yourapp.com
```

And `.env.example` with the same keys but no values.
