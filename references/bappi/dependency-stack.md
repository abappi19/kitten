---
title: Bappi's Canonical Dependency Stack
description: The complete, opinionated list of packages Bappi uses — mobile, tooling, and backend. Includes the version ranges, purpose, and what each replaces or avoids.
type: reference
when_to_load: When starting a new project, choosing between two libraries, adding a dependency, or reviewing if a package is part of Bappi's stack.
---

# Bappi's Canonical Dependency Stack

## Mobile / React Native

| Package | Version | Purpose | Replaces |
|---------|---------|---------|---------|
| `expo` | ~54 | Expo SDK + managed workflow | Bare RN setup |
| `expo-router` | ~6 | File-based navigation | React Navigation standalone |
| `@tanstack/react-query` | ^5 | Server state, caching | SWR, Redux Thunk |
| `zustand` | ^5 | Client state | Redux, Context API |
| `zod` | ^4 | Validation + type derivation | Yup, manual types |
| `react-hook-form` | ^7 | Form state | Formik |
| `@hookform/resolvers` | ^5 | Zod + RHF bridge | — |
| `expo-secure-store` | ~15 | Encrypted token storage | AsyncStorage for tokens |
| `@react-native-async-storage/async-storage` | ^2 | Non-sensitive app data | — |
| `@tanstack/query-async-storage-persister` | ^5 | Offline query cache | — |
| `@tanstack/react-query-persist-client` | ^5 | Query persistence provider | — |
| `react-native-flash-message` | ^0.4 | Toast notifications | Alert, Snackbar |
| `@shopify/flash-list` | ^2 | Performant lists | FlatList |
| `react-native-reanimated` | ~4 | Animations | Animated API |
| `react-native-gesture-handler` | ~2 | Gestures | TouchableOpacity for complex gestures |
| `react-native-safe-area-context` | ~5 | Safe area insets — `SafeAreaView`, `useSafeAreaInsets` | `SafeAreaView` from RN core (deprecated, will be removed) + hardcoded padding |
| `expo-image` | ~3 | Optimized images + blurhash | `Image` from RN |
| `expo-notifications` | ~0.32 | Push notifications | Firebase RN directly |
| `expo-haptics` | ~15 | Haptic feedback | — |
| `expo-constants` | ~18 | App config, runtime vars | — |
| `expo-dev-client` | ~6 | Custom dev builds | Expo Go |
| `expo-updates` | ~29 | OTA updates | — |
| `expo-font` | ~14 | Font loading | — |
| `expo-splash-screen` | ~31 | Splash screen control | — |
| `expo-in-app-updates` | ^0.9 | Play Store in-app updates | — |
| `expo-document-picker` | ~14 | File picker | — |
| `expo-file-system` | ~19 | File I/O | — |
| `expo-clipboard` | ~8 | Clipboard | — |
| `expo-location` | ~19 | Geolocation | — |
| `expo-linear-gradient` | ~15 | Gradient views | — |
| `react-native-keyboard-controller` | ^1 | Keyboard handling | KeyboardAvoidingView |
| `react-native-device-info` | ^15 | Device ID + metadata | — |
| `react-native-svg` | ~15 | SVG rendering | — |
| `react-native-svg-transformer` | ^1 | Import SVGs as components | — |
| `react-native-screens` | ~4 | Native screen optimization | — |
| `date-fns` | ^4 | Date utilities | moment.js |
| `uuid` | ^13 | UUID generation | — |

---

## Cross-Platform (Tamagui)

| Package | Purpose |
|---------|---------|
| `@tamagui/cli` | Build + watch the UI package |
| `tamagui` | Cross-platform component library |
| `@tamagui/*` (various) | Individual Tamagui packages (core, config, etc.) |

---

## Tooling (Dev Dependencies)

**Preferred lint/format stack:** ESLint + Prettier + lint-staged. Offer Biome as an alternative if the user prefers a single-tool setup.

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `eslint` | ^10 | Linting | **Preferred** |
| `@eslint/js` | ^10 | ESLint recommended JS rules | With ESLint |
| `typescript-eslint` | ^8 | TypeScript linting rules | With ESLint |
| `eslint-config-prettier` | ^10 | Disables conflicting ESLint format rules | With ESLint |
| `eslint-plugin-prettier` | ^5 | Runs Prettier as ESLint rule | With ESLint |
| `eslint-plugin-react` | ^7 | React-specific lint rules | With ESLint |
| `prettier` | ^3 | Code formatting | **Preferred** |
| `@biomejs/biome` | ^2 | Lint + format (single tool) | Alternative to ESLint + Prettier |
| `husky` | ^9 | Git hooks | manual scripts |
| `lint-staged` | ^16 | Run linters on staged files only | With ESLint + Prettier |
| `@commitlint/cli` | ^19 | Commit message linting | — |
| `@commitlint/config-conventional` | ^19 | Conventional commit rules | — |
| `@commitlint/types` | ^20 | TypeScript types for commitlint config | — |
| `@changesets/cli` | — | Changelog + version management | semantic-release |
| `turbo` | — | Monorepo build orchestration | nx, lerna |
| `knip` | — | Dead code + unused dep detection | depcheck |
| `syncpack` | — | Monorepo dependency version sync | — |
| `typescript` | ^5.9 | Type checking | — |
| `vitest` | ^2 | Web/monorepo test runner | Jest (for web) |

---

## Backend (NestJS)

| Package | Purpose |
|---------|---------|
| `@nestjs/core` + `@nestjs/common` | NestJS framework |
| `@nestjs/microservices` | RabbitMQ transport for microservices |
| `@nestjs/platform-express` | Express HTTP adapter |
| `@nestjs/typeorm` | TypeORM integration |
| `@nestjs/swagger` | API documentation |
| `@nestjs/throttler` | Rate limiting |
| `@nestjs/schedule` | Cron jobs |
| `@nestjs/config` | Env config with validation |
| `@nestjs/passport` + passport | Auth strategy |
| `@nestjs/websockets` + `@nestjs/platform-socket.io` | WebSocket support |
| `typeorm` | PostgreSQL ORM |
| `pg` | PostgreSQL driver |
| `redis` | Redis client |
| `amqplib` + `amqp-connection-manager` | RabbitMQ client |
| `firebase-admin` | Firebase push notifications |
| `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` | S3 file uploads |
| `sharp` | Server-side image processing |
| `ably` | Real-time websockets (alternative to socket.io) |
| `class-validator` + `class-transformer` | DTO validation |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT sign/verify |
| `nodemailer` | Email |
| `twilio` | SMS |
| `zod` | Validation (also used backend-side) |
| `@elastic/elasticsearch` | Search (some projects) |
| `rxjs` | Required by NestJS |

---

## What Bappi Avoids

| Avoid | Use Instead | Reason |
|-------|-------------|--------|
| Redux / Redux Toolkit | Zustand | Too much boilerplate for most apps |
| AsyncStorage for tokens | expo-secure-store | Not encrypted |
| `moment.js` | `date-fns` | Smaller, tree-shakable |
| `Animated` API | `react-native-reanimated` | Better performance, runs on UI thread |
| `FlatList` for large data | `@shopify/flash-list` | Better recycling, less jank |
| `Image` from RN | `expo-image` | Better caching, blurhash support |
| `SafeAreaView` from RN core | `react-native-safe-area-context` | Deprecated in RN core, will be removed |
| Jest for web projects | Vitest | Faster, native ESM |
| `KeyboardAvoidingView` | `react-native-keyboard-controller` | More reliable, less configuration |
| Global god-stores in Zustand | Feature-scoped stores | Easier to reason about, fewer re-renders |
| Expo Go for debugging | Expo Dev Client | Supports all native modules |
