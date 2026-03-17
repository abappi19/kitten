# ShopApp — Bare React Native Scaffold (baseline, no skill)

**Prompt:** Create a new React Native app called ShopApp — it's an e-commerce app for browsing and buying products. Use bare RN (not Expo). Scaffold auth, products, and cart.

---

## 1. Create the project

```bash
npx react-native init ShopApp --template react-native-template-typescript
cd ShopApp
```

## 2. Install dependencies

I'd recommend:
- React Navigation for routing
- Redux Toolkit or Context for state
- Axios for HTTP

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install @reduxjs/toolkit react-redux
npm install axios
```

## 3. Folder structure

```
src/
├── screens/
│   ├── auth/
│   │   └── LoginScreen.tsx
│   ├── products/
│   │   ├── ProductListScreen.tsx
│   │   └── ProductDetailScreen.tsx
│   └── cart/
│       └── CartScreen.tsx
├── store/
│   ├── index.ts
│   ├── authSlice.ts
│   ├── productsSlice.ts
│   └── cartSlice.ts
├── api/
│   └── client.ts
└── navigation/
    └── AppNavigator.tsx
```

## 4. Redux store

```ts
// store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import productsReducer from './productsSlice'
import cartReducer from './cartSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
  },
})
```

## 5. Cart slice

```ts
import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addItem: (state, action) => { state.items.push(action.payload) },
    removeItem: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload)
    },
  },
})

export const { addItem, removeItem } = cartSlice.actions
export default cartSlice.reducer
```

## 6. API client

```ts
import axios from 'axios'

const client = axios.create({
  baseURL: 'https://your-api.com/api',
  timeout: 5000,
})

export default client
```

## 7. Navigation

```tsx
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Products" component={ProductListScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

## Run

```bash
npx react-native run-ios
# or
npx react-native run-android
```
