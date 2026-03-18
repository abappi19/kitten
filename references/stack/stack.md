# Bappi's Stack — Detailed Opinions
---

## Mobile

### React Native + Expo
**Verdict:** Expo Managed Workflow first. Bare only when you genuinely hit its ceiling.

Why: Expo removes native build complexity. EAS Build (EAS Build) handles native compilation in the cloud. The ceiling is higher than most people think. When you do hit it, the `expo-modules-core` system makes native modules manageable.

When to go bare: a native module with no Expo equivalent, or granular control over the native build configuration is truly required.

### React Navigation
**Verdict:** The standard. Don't replace it.

Key rule: navigation state lives inside React Navigation, not in Zustand or any external store. This is a trap many devs fall into. React Navigation handles deep linking, back behavior, and gesture handling — you'll break all of that by externalizing navigation state.

Use `@react-navigation/native-stack` (not the JS-based Stack) for performance.

### MMKV
**Verdict:** MMKV over AsyncStorage. Always for performance-sensitive data.

Why: MMKV is synchronous, ~30x faster than AsyncStorage, backed by a C++ implementation. AsyncStorage is asynchronous — annoying for things like tokens that you need on every request. MMKV reads are instant and synchronous.

Use MMKV for: auth tokens, user preferences, cached data, Zustand persist.
Use AsyncStorage for: large blobs, or when on Expo Go without native modules.

### Reanimated
**Verdict:** Reanimated over the old Animated API for anything non-trivial.

Why: Reanimated runs animations on the UI thread (not JS thread), so it doesn't jank even when JS is busy. The old Animated API runs on JS thread — fine for simple fades, but anything gesture-driven needs Reanimated.

Combine with react-native-gesture-handler for gesture-based animations.

### expo-image
**Verdict:** Use instead of React Native's built-in `<Image>` for any list or frequently-loaded image.

Why: expo-image handles memory caching, disk caching, and blurhash placeholders. The built-in Image doesn't cache — scroll a FlatList down and back, images re-decode. expo-image also supports progressive loading.

---

## State Management

### Zustand
**Verdict:** Default for client state. Simple, fast, low ceremony.

When: global UI state, user preferences, cart, auth state — anything that needs to persist across screens.
Why over Redux / Redux Toolkit: no actions, no reducers, no dispatch. Define state and setters in one place, call them anywhere.
Why over Context: Context re-renders the whole tree on every update. Zustand subscriptions are surgical.

When Redux / Redux Toolkit is right: large teams (6+ engineers) that need enforced patterns and strong separation between state and side effects.

### TanStack Query
**Verdict:** Default for all server state management.

Why: caching, background refetching, stale-while-revalidate, optimistic updates, pagination — all built in. Don't manage loading/error state manually for API calls.

When to go custom: TanStack Query is too heavy or opinionated for the use case. Bappi builds lightweight custom cache layers in these cases.

Key config: set `staleTime` and `gcTime` thoughtfully. Default staleTime of 0 means every mount triggers a refetch — too aggressive for most apps.

### XState
**Verdict:** For complex, multi-step UI flows only. Not a replacement for Zustand.

When: checkout flows, multi-step forms, auth flows with many states, any UI where you've got more than 3 boolean flags tracking state.

Why: explicit state machine — boolean soup (`isLoading && !isError && hasSubmitted && !isRetrying`) is impossible to reason about. A state machine makes states explicit, transitions documented, and impossible states unrepresentable.

---

## Web

### Next.js
**Verdict:** Default for web, especially alongside Expo in a monorepo.

Use App Router. Pages Router is legacy. RSC for data-fetching pages, Client Components for interactive UI.

### Tailwind CSS
**Verdict:** Default for Next.js web styling.

Why: utility-first keeps styles co-located with markup, eliminates naming fatigue, produces consistent output when combined with design tokens tokens.

---

## Backend

### Hono.js
**Verdict:** Bappi's preferred lightweight backend framework.

Why: middleware-first, composable, tiny bundle size, first-class TypeScript, works on Node/Bun/Cloudflare Workers/Deno.

### Node.js / Express
**Verdict:** For traditional REST APIs where team familiarity matters.

Express is the safe choice. Use it when any Node developer needs to be able to maintain it.

### Next.js API Routes
**Verdict:** For speed of delivery when the backend is simple.

Not ideal for complex server logic (no middleware composition, cold starts on serverless). Good for: simple CRUD, form handlers, webhooks.

### PostgreSQL
**Verdict:** Default relational database.

Bappi uses a function-driven architecture — business logic in PostgreSQL functions rather than scattered through the application layer.

### Redis
**Verdict:** For caching and ephemeral state.

Use for: session storage, rate limiting, pub/sub, cache invalidation, job queues. Don't use as a primary database.

---

## Tooling

### Turborepo
**Verdict:** For monorepo. The build caching alone is worth it.

Why: intelligent build caching (only rebuilds what changed), parallel execution, clear task dependency graph.

### ESLint + Prettier
**Verdict:** Default choice. ESLint for linting, Prettier for formatting. Run together via lint-staged on commit.

Use flat config (`eslint.config.mjs`) with `typescript-eslint` + `eslint-config-prettier` + `eslint-plugin-prettier`.

### Biome
**Verdict:** A valid alternative — single tool for lint + format, significantly faster, no config conflicts.

Offer Biome if the user prefers a simpler setup or explicitly asks for it. Don't push it as the default. ESLint + Prettier gives more control and plugin flexibility.

### Husky + lint-staged + commitlint
**Verdict:** Git hooks for quality gates.

Pre-commit: lint-staged (Prettier + ESLint --fix on staged files only)
Commit-msg: commitlint (enforce conventional commits + wip/hotfix types)
Pre-push (optional): type-check

Keep hooks fast — slow hooks get disabled.

### Changesets
**Verdict:** For versioning and changelog management in monorepo.

Explicitly tracks which packages changed and what kind of change (patch/minor/major). Generates changelogs automatically.

---

## Observability

### Sentry
**Verdict:** Default for error tracking.

Set up error boundaries with `Sentry.captureException`. Add custom context (user ID, app version, screen name) to every error.

### Firebase Analytics
**Verdict:** For product-level event tracking.

Use for: screen views, user flows, funnel analysis, A/B testing. Keep events consistent and well-named.

### OpenTelemetry
**Verdict:** For distributed tracing in microservice environments.

Know what traces and spans are, know how to instrument a Node.js service.

---

## CI/CD

### GitHub Actions
**Verdict:** Default CI platform.

Standard pipeline: lint → type-check → test → build → deploy.

### EAS Build / EAS Update (OTA) / EAS Submit (EAS)
**Verdict:** Full EAS workflow for React Native apps.

- **EAS Build**: cloud-based native builds. No Xcode/Android Studio required locally.
- **EAS Update (OTA)**: OTA JS bundle updates. Fix bugs without store resubmission.
- **EAS Submit**: automated App Store / Google Play submission.
- **Expo Dev Client**: custom dev builds for testing native modules during development.

Key rule: EAS Update (OTA) (OTA) is for JS-layer bug fixes only. Never push a new native dependency via EAS Update (OTA) — it will crash.

---

## Testing

### Jest / Vitest
Jest for React Native, Vitest for web/Node (it's faster).

### React Testing Library
Philosophy: test behavior not implementation. Query by role and label, not by component internals.

### msw
**Verdict:** For mocking network requests in tests.

Why over manual Axios mocks: msw intercepts at the network level, so your actual fetch code runs unchanged.

### Detox / Maestro
Maestro is simpler to set up and write. Detox is more powerful but more configuration overhead. Start with Maestro, graduate to Detox if you need more control.

test pyramid rule: most tests should be unit/integration. E2E is expensive — reserve for critical user flows.
