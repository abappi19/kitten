# FoodTracker — Expo App Scaffold (with skill)

**Prompt:** I want to start a new Expo app called FoodTracker. It's a meal logging app. Scaffold auth and home features.

---

## Step 1 — Check latest Expo version

```bash
npm view expo version
```

> Run this first. Use the result to confirm `create-expo-app@latest` is pulling the right version.

---

## Step 2 — Bootstrap

```bash
npx create-expo-app@latest FoodTracker --template blank-typescript
cd FoodTracker
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

---

## Step 3 — Install the stack

```bash
npx expo install zustand @tanstack/react-query axios react-hook-form zod @hookform/resolvers
npx expo install @react-native-mmkv/storage
```

---

## Step 4 — Folder structure created

```
FoodTracker/
├── .env
├── .env.example
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── (auth)/
│       └── login.tsx
└── src/
    ├── features/
    │   ├── auth/
    │   │   ├── api/useAuth.ts
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   ├── screens/AuthScreen.tsx
    │   │   ├── store/authStore.ts
    │   │   └── types.ts
    │   └── home/
    │       ├── api/useHome.ts
    │       ├── components/
    │       ├── hooks/
    │       ├── screens/HomeScreen.tsx
    │       ├── store/homeStore.ts
    │       └── types.ts
    ├── shared/
    │   ├── components/
    │   ├── hooks/
    │   ├── utils/
    │   ├── constants/
    │   └── types/
    └── services/
        ├── api.ts
        └── storage.ts
```

---

## Step 5 — Boilerplate files

### `app/_layout.tsx`
```tsx
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
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

### `app/index.tsx`
```tsx
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>FoodTracker</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600' },
})
```

### `app/(auth)/login.tsx`
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
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => {
    // call auth store action
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Email" onChangeText={onChange} value={value} autoCapitalize="none" keyboardType="email-address" />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput style={styles.input} placeholder="Password" onChangeText={onChange} value={value} secureTextEntry />
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
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8, fontSize: 16 },
  error: { color: '#ef4444', fontSize: 13, marginBottom: 8 },
  button: { backgroundColor: '#6366f1', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
```

### `src/services/api.ts`
```ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
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
      // clear auth, redirect to login
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

### `src/features/auth/api/useAuth.ts`
```ts
import { useMutation } from '@tanstack/react-query'
import { api } from '../../../services/api'
import { useAuthStore } from '../store/authStore'

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth)
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post('/auth/login', data),
    onSuccess: (res) => setAuth(res.user, res.token),
  })
}
```

### `src/features/auth/types.ts`
```ts
export interface User {
  id: string
  email: string
  name: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}
```

### `src/features/home/store/homeStore.ts`
```ts
import { create } from 'zustand'

interface HomeState {
  selectedDate: string
  setSelectedDate: (date: string) => void
}

export const useHomeStore = create<HomeState>((set) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  setSelectedDate: (date) => set({ selectedDate: date }),
}))
```

### `src/features/home/api/useHome.ts`
```ts
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../services/api'

export function useMealLogs(date: string) {
  return useQuery({
    queryKey: ['meal-logs', date],
    queryFn: () => api.get(`/meals?date=${date}`),
  })
}
```

### `src/features/home/types.ts`
```ts
export interface MealLog {
  id: string
  date: string
  name: string
  calories: number
  createdAt: string
}
```

### `.env`
```
EXPO_PUBLIC_API_URL=https://api.foodtracker.com
```

---

## Step 6 — Summary

**Files created:** 15 files, 2 features scaffolded

**Run the app:**
```bash
npx expo start
```

**Next steps:**
1. Fill in `EXPO_PUBLIC_API_URL` in `.env`
2. Implement the login mutation in `useAuth.ts`
3. Build out `HomeScreen` with `useMealLogs`
4. Add protected route logic in `_layout.tsx` using `useAuthStore`
