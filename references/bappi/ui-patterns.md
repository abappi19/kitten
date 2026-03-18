---
title: Bappi's UI Patterns
description: Button, Text, Layout primitives, theme token structure, React Navigation theme integration, flash messages, cross-platform Tamagui toast, Expo image usage, and FlashList for performant lists.
type: reference
---

# Bappi's UI Patterns

## Layer Hierarchy

```
lib/ui/          ← *.ui.tsx — Atoms: Button, Text, Input (pure, no data)
lib/components/  ← *.component.tsx — Domain components (composed from ui/)
lib/screens/     ← *.screen.tsx — Route-level (composed from components/)
lib/containers/  ← *.container.tsx — Providers and layout shells
```

UI atoms know nothing about data. Components know nothing about API calls.

---

## Button Primitive

```tsx
// lib/ui/button.ui.tsx
type ButtonProps = {
    onPress: () => void;
    text: string;
    isLoading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    indicatorColor?: string;
} & TouchableOpacityProps;

export const Button: React.FC<ButtonProps> = ({
    onPress,
    text,
    isLoading,
    icon,
    iconPosition = "left",
    indicatorColor = "#fff",
    ...props
}) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={isLoading || props.disabled}
        {...props}
    >
        <View style={[styles.container, props.disabled && styles.disabled]}>
            {iconPosition === "left" && !isLoading && icon}
            {isLoading
                ? <ActivityIndicator size="small" color={indicatorColor} />
                : <Text style={[styles.text, props.textStyle]}>{text}</Text>
            }
            {iconPosition === "right" && !isLoading && icon}
        </View>
    </TouchableOpacity>
);
```

`isLoading` replaces the button text — no separate loading button needed.

---

## Text Primitive

```tsx
// lib/ui/text.ui.tsx
type TextProps = RNTextProps & {
    variant?: "body" | "heading" | "caption" | "label";
};

export const Text: React.FC<TextProps> = ({ variant = "body", style, ...props }) => (
    <RNText style={[styles[variant], style]} {...props} />
);

const styles = StyleSheet.create({
    heading: { fontSize: 24, fontFamily: "Inter_700Bold", color: theme.bodyColor },
    body: { fontSize: 16, fontFamily: "Inter_400Regular", color: theme.bodyColor },
    caption: { fontSize: 12, fontFamily: "Inter_400Regular", color: theme.mutedColor },
    label: { fontSize: 14, fontFamily: "Inter_500Medium", color: theme.bodyColor },
});
```

---

## Layout Container

```tsx
// lib/containers/layout/layout.container.tsx
export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
    <SafeAreaView style={styles.wrapper}>
        <KeyboardAwareView>
            {children}
        </KeyboardAwareView>
    </SafeAreaView>
);
```

---

## Theme Tokens

Theme is a flat object of named semantic tokens. All StyleSheet definitions import from here — never hardcode colors.

```ts
// lib/styles/theme.style.ts
import { COLORS } from "./variables.style";

export const theme = {
    // Base
    bodyBgColor: "rgb(0, 0, 0)",
    bodyColor: "rgb(255, 255, 255)",
    mutedColor: "rgb(204, 204, 204)",
    primaryColor: COLORS.$white,

    // Navigation
    headerColor: "rgb(5, 7, 11)",
    tabbarColor: "rgb(5, 7, 11)",

    // Buttons
    btnPrimaryBg: "rgb(255, 255, 255)",
    btnPrimaryColor: "rgb(0, 0, 0)",
    btnDangerColor: "rgb(236, 0, 65)",
    btnDeleteBg: "rgb(236, 0, 65)",

    // Forms
    textFieldBgColor: "rgba(0, 0, 0, 0.54)",
    textFieldActiveBorderColor: "rgb(255, 255, 255)",
    textFieldPlaceholderColor: "rgba(255, 255, 255, 0.7)",
    inputFieldErrorColor: "rgb(255, 53, 53)",

    // Feedback
    formFeedbackErrorBgColor: "rgb(255, 53, 53)",
    formFeedbackSuccessBgColor: "rgb(90, 174, 74)",

    // Modal
    modalBg: "rgb(32, 32, 32)",
    modalBackdropBg: "rgba(0, 0, 0, 0.8)",
};
```

---

## React Navigation Theme

```ts
// lib/styles/theme.style.ts
import type { Theme } from "@react-navigation/native";

export const AppNavigationTheme: Theme = {
    dark: true,
    colors: {
        primary: COLORS.$white,
        background: COLORS.$black,
        card: "#202020",
        text: COLORS.$white,
        border: COLORS.$white,
        notification: COLORS.$red_dark,
    },
    fonts: {
        bold: { fontFamily: "Inter_700Bold", fontWeight: "700" },
        regular: { fontFamily: "Inter_400Regular", fontWeight: "400" },
        heavy: { fontFamily: "Inter_900Black", fontWeight: "900" },
        medium: { fontFamily: "Inter_400Regular", fontWeight: "400" },
    },
};
```

Applied at the root:
```tsx
<NavigationContainer theme={AppNavigationTheme}>
```

---

## Flash Message (Toasts)

Single instance at the app root:
```tsx
// app/_layout.tsx
<FlashMessage position="top" />
```

Used everywhere via `showMessage`:
```ts
showMessage({ message: "Saved successfully", type: "success" });
showMessage({ message: error?.message || "Something went wrong", type: "danger" });
showMessage({ message: "Email confirmation required", type: "warning" });
```

---

## Tamagui Toast (Cross-Platform)

For cross-platform apps using Tamagui:

```ts
const toast = useToastController();

// Success with haptic
toast.show("Welcome back!", {
    burntOptions: { preset: "done", haptic: "success" },
});

// Error with haptic
toast.show("Login failed", {
    burntOptions: { preset: "error", haptic: "error" },
});
```

---

## expo-image (Optimized Images)

Always `expo-image` over `Image` from React Native. Supports blurhash placeholders and better memory management:

```tsx
import { Image } from "expo-image";

<Image
    source={{ uri: imageUrl }}
    style={styles.avatar}
    placeholder={blurhash}             // show while loading
    contentFit="cover"
    transition={200}                   // fade in
    cachePolicy="memory-disk"          // aggressive caching
/>
```

Generate blurhash server-side (e.g., with `blurhash-from-url` in the backend), store alongside the image URL.

---

## FlashList (Performant Lists)

Always `@shopify/flash-list` over `FlatList` for any non-trivial list:

```tsx
import { FlashList } from "@shopify/flash-list";

<FlashList
    data={items}
    renderItem={({ item }) => <ItemCard item={item} />}
    estimatedItemSize={80}              // required — average item height
    keyExtractor={item => item.id}
    onEndReached={fetchNextPage}
    onEndReachedThreshold={0.5}
    ListEmptyComponent={<EmptyState />}
    refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={refetch} />
    }
/>
```

`estimatedItemSize` must be accurate — it affects layout performance.

---

## Keyboard Handling

`react-native-keyboard-controller` over `KeyboardAvoidingView`:

```tsx
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

<KeyboardAwareScrollView
    bottomOffset={20}
    keyboardShouldPersistTaps="handled"
>
    {/* Form content */}
</KeyboardAwareScrollView>
```

---

## BAD vs GOOD

```tsx
// ❌ BAD — hardcoded color in component
<View style={{ backgroundColor: "#000000" }}>

// ✅ GOOD — semantic theme token
<View style={{ backgroundColor: theme.bodyBgColor }}>
```

```tsx
// ❌ BAD — FlatList for a large list
<FlatList data={items} renderItem={...} />

// ✅ GOOD — FlashList
<FlashList data={items} estimatedItemSize={80} renderItem={...} />
```

```tsx
// ❌ BAD — Image from react-native (no placeholder, poor memory)
import { Image } from "react-native";
<Image source={{ uri: url }} />

// ✅ GOOD
import { Image } from "expo-image";
<Image source={{ uri: url }} placeholder={blurhash} contentFit="cover" />
```
