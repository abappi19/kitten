---
title: Bappi's Navigation Patterns
description: Expo Router file structure, route groups, tab navigators, nested stacks, multi-role routing, post-mutation navigation rules, auth guards, and cross-platform navigation differences.
type: reference
when_to_load: When implementing or reviewing navigation — route structure, auth guards, tab setup, deep linking, or navigation after mutations.
---

# Bappi's Navigation Patterns

## Expo Router File Structure

Routes mirror folder structure. `app/` is thin — only route definitions and redirects. Logic lives in `lib/screens/`.

```
app/
  _layout.tsx               ← Root stack: fonts, providers, splash screen
  index.tsx                 ← Entry — redirects based on auth state
  +not-found.tsx            ← 404 fallback
  (auth)/
    _layout.tsx             ← Stack for auth flow
    index.tsx               ← Login screen
    sign-up/
      _layout.tsx
      client.tsx
      specialist.tsx
    recovery/
      _layout.tsx
      forgot-password.tsx
      verify-email.tsx      ← OTP input
      set-new-password.tsx
  (tabs)/
    _layout.tsx             ← Bottom tab navigator (default user)
    index.tsx               ← Home
    bookings.tsx
    messages.tsx
    orders.tsx
    profile.tsx
  (client-user)/
    _layout.tsx             ← Client-specific tab navigator
    (client-tabs)/
      _layout.tsx
      index.tsx
      profile.tsx
  (specialist-user)/
    _layout.tsx             ← Specialist-specific tab navigator
    (specialist-tabs)/
      _layout.tsx
      index.tsx
      profile.tsx
    profile/
      mutations/            ← Mutation screens (add/edit)
        add-certificate.tsx
        edit-profile.tsx
  [feature]/
    index.tsx               ← List
    [id].tsx                ← Detail
    mutation/
      add-[feature].tsx     ← Create flow
      update-[feature].tsx  ← Edit flow
```

---

## Route Groups

Expo Router `(group)` folders create logical navigation stacks without adding to the URL. Patterns observed:

| Group | Purpose |
|-------|---------|
| `(auth)` | Authentication screens |
| `(tabs)` | Bottom tab navigator |
| `(client-user)` | All client screens |
| `(specialist-user)` | All specialist screens |
| `(item-details)` | Detail modal stack |
| `(protected)` | Auth-gated screens |

Nested groups create nested navigators. `_layout.tsx` at each level defines the navigator type.

---

## Tab Navigator

```tsx
// app/(tabs)/_layout.tsx
export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
                }}
            />
            <Tabs.Screen name="bookings" options={{ title: "Bookings" }} />
            <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        </Tabs>
    );
}
```

---

## Auth Guard Pattern

In `_layout.tsx` of any protected group:

```tsx
const { isAuthenticated, isLoading } = useAuthProvider();

if (isLoading) return <SplashScreen />;
if (!isAuthenticated) return <Redirect href="/auth" />;

return <Stack />;
```

For multi-role apps, guard checks both authentication and role:

```tsx
const { isAuthenticated, userType } = useAuthProvider();

if (!isAuthenticated) return <Redirect href="/auth" />;
if (userType !== "client") return <Redirect href="/specialist-user" />;
```

---

## Entry Screen (index.tsx) Routing

The root `app/index.tsx` reads auth state and redirects — it renders nothing itself:

```tsx
export default function Index() {
    const { isAuthenticated, isLoading, userType } = useAuthProvider();

    if (isLoading) return <SplashScreen />;

    if (!isAuthenticated) return <Redirect href="/auth" />;

    if (userType === "client") return <Redirect href="/client-user" />;
    if (userType === "specialist") return <Redirect href="/specialist-user" />;

    return <Redirect href="/home" />;
}
```

---

## Navigation After Mutations

| Scenario | Method | Reason |
|----------|--------|--------|
| Login success | `router.replace("/")` | Clear auth stack — no back navigation to login |
| Logout | `router.replace("/")` | Clear all stacks |
| Registration → email verify | `router.push("/auth/verify-email")` | Keep back stack (user can go back) |
| Password reset → login | `router.replace("/auth")` | Replace — no back to reset flow |
| Intermediate wizard step | `router.push("/next-step")` | Keep history |
| Force-logout after token failure | `router.replace("/")` | Clear everything |

---

## Mutation Screens

Create and update flows live under `mutation/` sub-folders, not route groups:

```
app/[feature]/
  index.tsx              ← List screen
  [id].tsx               ← View detail
  mutation/
    add-[feature].tsx    ← Create
    update-[feature].tsx ← Edit
    add-description.tsx  ← Step 2 of a multi-step add flow
    add-details.tsx      ← Step 3
```

Multi-step mutation flows are separate screens, not a single screen with conditional rendering.

---

## Cross-Platform Navigation

For Tamagui/cross-platform apps, navigation differs by platform. Always check `isWeb`:

```ts
// Native
router.replace("/client-user");

// Web (Next.js)
if (isWeb) {
    redirect("/client-user"); // or router.push for Next.js
} else {
    router.replace("/client-user");
}
```

---

## Deep Linking / Intent Filters

Configured in `app.config.ts`:

```ts
android: {
    intentFilters: [{
        action: "VIEW",
        autoVerify: true,
        data: [{ scheme: "https", host: "myapp.com", pathPrefix: "/auth" }],
        category: ["BROWSABLE", "DEFAULT"],
    }],
},
```

---

## Expo Router Root Layout Pattern

```tsx
// app/_layout.tsx
export default function RootLayout() {
    const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold });

    useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <QueryProvider>
            <AuthProvider>
                <FlashMessage position="top" />
                <Stack screenOptions={{ headerShown: false }} />
            </AuthProvider>
        </QueryProvider>
    );
}
```

---

## BAD vs GOOD

```tsx
// ❌ BAD — navigation logic inside a component
function LoginButton() {
    const navigate = () => router.push("/home");
    return <Button onPress={navigate} text="Login" />;
}

// ✅ GOOD — navigation in the mutation's onSuccess, not in the UI
export function useLogin() {
    return useMutation({
        onSuccess: () => router.replace("/home"),
    });
}
```

```tsx
// ❌ BAD — no guard, authenticated content accessible to unauthenticated users
export default function Layout() {
    return <Stack />;
}

// ✅ GOOD
export default function Layout() {
    const { isAuthenticated } = useAuthProvider();
    if (!isAuthenticated) return <Redirect href="/auth" />;
    return <Stack />;
}
```
