# React Native Skills — Overview

Quick-reference summary of every rule in this library. Read this first to identify which specific rule files to fetch.

---

## Rendering — Core

### rendering-no-falsy-and.md
**Impact:** CRITICAL
Never use `&&` with potentially falsy values (empty string, 0) — React Native crashes if a non-Text node renders a string. Use ternary `? :` instead.

### rendering-text-in-text-component.md
**Impact:** CRITICAL
All strings must render inside `<Text>` components. React Native crashes if a string is a direct child of `<View>`.

---

## List Performance

### list-performance-virtualize.md
**Impact:** HIGH
Use LegendList or FlashList instead of ScrollView with .map() — virtualize even short lists for lower memory and faster mounts.

### list-performance-callbacks.md
**Impact:** MEDIUM
Create callback functions once at the list root level, not per-render inside renderItem.

### list-performance-function-references.md
**Impact:** CRITICAL
Don't .map()/.filter() data before passing to lists — keep stable object references so the virtualizer knows what changed.

### list-performance-images.md
**Impact:** HIGH
Load appropriately-sized compressed images via CDN parameters — never full-resolution in lists.

### list-performance-inline-objects.md
**Impact:** HIGH
Don't create new objects inside renderItem — pass primitives or stable references to maintain memoization.

### list-performance-item-expensive.md
**Impact:** HIGH
List items should receive only primitives — move queries, hooks, and expensive computations to the parent.

### list-performance-item-memo.md
**Impact:** HIGH
Pass primitive props (strings, numbers, booleans) to list items to enable shallow comparison in memo().

### list-performance-item-types.md
**Impact:** HIGH
Use `getItemType` to separate heterogeneous list items into recycling pools for efficient reuse.

---

## Animation

### animation-derived-value.md
**Impact:** MEDIUM
Use `useDerivedValue` for deriving shared values, not `useAnimatedReaction` — that's for side effects only.

### animation-gesture-detector-press.md
**Impact:** MEDIUM
Use `GestureDetector` with UI thread worklets for animated press states instead of Pressable's JS callbacks.

### animation-gpu-properties.md
**Impact:** HIGH
Animate `transform` and `opacity` (GPU-accelerated) instead of `width`, `height`, `margin`, `padding` (triggers layout).

---

## Scroll

### scroll-position-no-state.md
**Impact:** HIGH
Never track scroll position in useState — use Reanimated shared values or refs to prevent render thrashing.

---

## Navigation

### navigation-native-navigators.md
**Impact:** HIGH
Use native stack/tab navigators (native-stack, bottom-tabs) instead of JS-based navigators for better performance.

---

## React State

### react-state-dispatcher.md
**Impact:** MEDIUM
Use `setState(prev => ...)` functional updater when next state depends on current value — avoids stale closures.

### react-state-fallback.md
**Impact:** MEDIUM
Initialize state to `undefined` and use nullish coalescing (`??`) for reactive fallbacks from props or server data.

### react-state-minimize.md
**Impact:** MEDIUM
Derive values during render instead of storing in state. Use the fewest state variables possible.

---

## State Architecture

### state-ground-truth.md
**Impact:** HIGH
Store actual state (pressed, progress, isOpen), not derived visual values (scale, opacity). Derive visuals from ground truth.

---

## React Compiler

### react-compiler-destructure-functions.md
**Impact:** HIGH
Destructure functions from hooks at top of render — never dot into objects. Maintains stable references with React Compiler.

### react-compiler-reanimated-shared-values.md
**Impact:** LOW
Use `.get()` and `.set()` instead of `.value` on Reanimated shared values for React Compiler compatibility.

---

## UI — User Interface

### ui-expo-image.md
**Impact:** HIGH
Use `expo-image` instead of `Image` for memory-efficient caching, blurhash placeholders, and progressive loading.

### ui-image-gallery.md
**Impact:** MEDIUM
Use `@nandorojo/galeria` for image galleries with native shared element transitions and pinch-to-zoom.

### ui-measure-views.md
**Impact:** MEDIUM
Use `useLayoutEffect` (sync) + `onLayout` (updates) for measuring views. Use functional setState for comparisons.

### ui-menus.md
**Impact:** HIGH
Use native platform menus via `zeego` instead of custom JS dropdown implementations.

### ui-native-modals.md
**Impact:** HIGH
Use native `<Modal>` with `presentationStyle="formSheet"` instead of JS-based bottom sheet libraries.

### ui-pressable.md
**Impact:** LOW
Never use `TouchableOpacity` or `TouchableHighlight` — use `Pressable` instead.

### ui-safe-area-scroll.md
**Impact:** MEDIUM
Use `contentInsetAdjustmentBehavior="automatic"` on ScrollView instead of wrapping with SafeAreaView.

### ui-scrollview-content-inset.md
**Impact:** LOW
Use `contentInset` instead of padding for dynamic ScrollView spacing — avoids layout recalculation.

### ui-styling.md
**Impact:** MEDIUM
Use `borderCurve: 'continuous'`, `gap`, CSS gradients, box-shadow, and consistent font sizing patterns.

---

## Design System

### design-system-compound-components.md
**Impact:** MEDIUM
Use compound components (Button + ButtonText + ButtonIcon) for design system elements instead of polymorphic children.

---

## Monorepo

### monorepo-native-deps-in-app.md
**Impact:** CRITICAL
Install native packages in the app's package.json directly — autolinking only works from the app directory in monorepos.

### monorepo-single-dependency-versions.md
**Impact:** MEDIUM
Use exact, single versions of each dependency across all monorepo packages to avoid duplicates and conflicts.

---

## Third-Party Dependencies

### imports-design-system-folder.md
**Impact:** LOW
Re-export dependencies from a design system folder to enable global swaps and easy refactoring.

---

## JavaScript

### js-hoist-intl.md
**Impact:** LOW-MEDIUM
Create `Intl.DateTimeFormat`/`NumberFormat` at module scope, not inside render or loops.

---

## Fonts

### fonts-config-plugin.md
**Impact:** LOW
Use Expo's config plugin for native font embedding at build time instead of async `useFonts` hook.
