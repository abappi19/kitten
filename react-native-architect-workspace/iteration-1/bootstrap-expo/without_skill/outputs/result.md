# FoodTracker — Expo App Scaffold (baseline, no skill)

**Prompt:** I want to start a new Expo app called FoodTracker. It's a meal logging app. Scaffold auth and home features.

---

Here's how I'd set up FoodTracker:

## 1. Create the project

```bash
npx create-expo-app FoodTracker --template
```

Choose the blank TypeScript template.

## 2. Install dependencies

```bash
cd FoodTracker
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install zustand
npm install axios
```

## 3. Project structure

```
src/
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   └── home/
│       └── HomeScreen.tsx
├── components/
│   └── Button.tsx
├── store/
│   └── authStore.ts
├── api/
│   └── client.ts
└── navigation/
    └── AppNavigator.tsx
```

## 4. Auth store

```ts
import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}))
```

## 5. API client

```ts
import axios from 'axios'

const client = axios.create({
  baseURL: 'https://your-api.com',
})

export default client
```

## 6. Navigation

```tsx
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

## 7. HomeScreen

```tsx
import React from 'react'
import { View, Text } from 'react-native'

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Welcome to FoodTracker!</Text>
    </View>
  )
}
```

## 8. LoginScreen

```tsx
import React, { useState } from 'react'
import { View, TextInput, Button } from 'react-native'

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    // call API
    navigation.navigate('Home')
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={handleLogin} />
    </View>
  )
}
```

## Run the app

```bash
npx expo start
```
