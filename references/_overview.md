# References — Overview

All reference files available in the Kitten skill. Read this file first to decide which references to load for a given task. Fetch only what the task actually needs. Never fetch an entire directory — use each section's `_overview.md` to identify the specific files to load.

---

## `references/bappi/`

Identity, philosophy, and real-world engineering knowledge extracted from Bappi's production projects.

### Identity & Voice

| File | Title | Description | When to load |
|------|-------|-------------|--------------|
| `references/bappi/profile.md` | Bappi's Full Profile | Complete profile — engineering philosophy, work style, principles, advanced competencies, and what Bappi has built. | Deep identity questions, attributing a strong engineering opinion, or when the user asks who Bappi is beyond a one-liner. |
| `references/bappi/thinking.md` | Bappi's Thinking Process | How Bappi thinks — problem decomposition, research-done checklist, architecture decisions, debugging sequence, code review rules, fail-fast vs degrade, non-negotiables. | Planning a feature, debugging, reviewing code, or any task where reasoning process matters — not just the answer. |
| `references/bappi/writing-style.md` | Bappi's Writing Style | Real voice samples and observed patterns — two writing modes with examples, key patterns, and what Bappi does not do. | Calibrating tone and voice for any response. Load alongside communication-style.md when precise voice matching matters. |
| `references/bappi/code-review.md` | Bappi's Code Review Style | Review process, blocking vs suggestion rule, wrong approach handling, junior vs senior tone, multiple options format. | Load when conducting any code review — gives the agents/code-reviewer.md agent tone and approach guidance. |

### Architecture & Structure

| File | Title | Description | When to load |
|------|-------|-------------|--------------|
| `references/bappi/folder-structure.md` | Folder Structure Conventions | Lib-style standalone, Turborepo monorepo, library-style, file suffix conventions (.component, .screen, .service, .store, .schema), dependency boundaries, barrel exports, and scaffold script. | Scaffolding a project, discussing folder layout, deciding where a new file belongs. |
| `references/bappi/monorepo.md` | Monorepo Patterns | Turborepo pipeline, workspace structures, what goes in packages/, shared config package pattern, platform-split files, pnpm/yarn workspaces. | Designing or working inside a monorepo — structure, package boundaries, or Turborepo pipeline. |

### Networking & Data

| File | Title | Description | When to load |
|------|-------|-------------|--------------|
| `references/bappi/api-layer.md` | API Layer | FetchClient class (native fetch), 401/403 refresh intercept with exponential backoff, Axios apiClient with refresh queue, endpoint constants structure. | Implementing API calls, reviewing network layer, designing fetch abstraction, handling token refresh. |
| `references/bappi/state-management.md` | State Management (Zustand) | Store patterns, persist middleware, non-persisted flow state, outside-React access via .getState(), client vs server state separation. | Designing stores, reviewing Zustand usage, deciding what goes in Zustand vs TanStack Query. |
| `references/bappi/server-state.md` | Server State (TanStack Query) | QueryClient config, query persistence, query key factories, useQuery/useMutation patterns, cache manipulation, cross-platform persistence. | Implementing data fetching, mutations, caching, or reviewing service hook structure. |
| `references/bappi/schema-validation.md` | Schema & Validation (Zod) | Per-feature schema files, z.infer for type derivation, cross-field refinements, response interfaces vs form schemas, React Hook Form integration. | Writing form validation, API payloads, DTO types, or any data contract between layers. |

### Auth, Navigation & Storage

| File | Title | Description | When to load |
|------|-------|-------------|--------------|
| `references/bappi/auth-flow.md` | Auth Flow | Login/register/logout sequences, forgot password/OTP flow, token refresh, AuthProvider context, social auth, multi-role navigation. | Any auth feature — login, logout, registration, password reset, social auth, auth guards. |
| `references/bappi/navigation.md` | Navigation Patterns | Expo Router file structure, route groups, tab navigators, auth guards, post-mutation navigation rules (replace vs push), entry screen routing, mutation screens. | Navigation — route structure, auth guards, tab setup, deep linking, navigation after mutations. |
| `references/bappi/storage.md` | Storage Patterns | SecureStore for tokens, AsyncStorageService singleton, cross-platform TokenService, token key constants, query cache persistence, storage decision table. | Any storage implementation — tokens, user data, app preferences, query cache. |
| `references/bappi/env-config.md` | Environment Config | getEnvVars() factory, EXPO_PUBLIC_ prefix, per-environment config objects, app.config.ts runtime injection, EAS build profile env, Turbo globalEnv. | Setting up env vars, reviewing config access, working with app.config.ts or eas.json. |

### UI & Patterns

| File | Title | Description | When to load |
|------|-------|-------------|--------------|
| `references/bappi/ui-patterns.md` | UI Patterns | Button/Text primitives, theme tokens, React Navigation theme, flash messages, Tamagui toast, expo-image with blurhash, FlashList, keyboard handling. | Building UI components, setting up a theme, working with lists, images, or toast notifications. |

### Tooling & Infrastructure

| File | Title | Description | When to load |
|------|-------|-------------|--------------|
| `references/bappi/tooling.md` | Tooling Setup | Biome config (tabs, 4-width, 120-line, double quotes), Husky hooks, Commitlint (wip/hotfix types), Changesets, bun, EAS build profiles, verify script, knip, syncpack, VSCode config. | Setting up project tooling, writing commit messages, troubleshooting lint/format/hook failures. |
| `references/bappi/backend.md` | Backend Patterns (NestJS) | Microservices architecture, gateway controller pattern, RabbitMQ transport, TypeORM, Redis, AWS S3, Firebase push, Ably websockets, throttling, Swagger, Dockerfile, Jenkins pipeline. | Working on or reviewing NestJS backend code — microservice architecture, module setup, infrastructure. |
| `references/bappi/nextjs.md` | Next.js & Web Patterns | ISR patterns, App Router, Tamagui cross-platform, Tailwind setup, syncpack/knip for monorepo health, web-specific service patterns. | Working on Next.js web apps, cross-platform Tamagui setups, or web-specific concerns in a monorepo. |
| `references/bappi/cicd.md` | CI/CD Patterns | EAS build profiles, GitHub Actions for mobile builds, Jenkins for backend microservices (parallel Docker builds), release-please, branch→environment mapping. | Setting up CI/CD, configuring EAS builds, writing GitHub Actions workflows, deployment strategy. |

### Debugging & Testing

| File | Title | Description | When to load |
|------|-------|-------------|--------------|
| `references/bappi/debugging.md` | Debugging Patterns | Structured error logging, Reactotron setup, Flash Message for user errors, platform-aware error context, common silent failure patterns. | Debugging, tracing errors, reviewing error handling code, setting up observability. |
| `references/bappi/testing.md` | Testing Patterns | Vitest for web/monorepo, Jest + jest-expo for RN, msw for API mocking, RTL, Detox/Maestro E2E, Storybook, test pyramid, test file layout. | Writing tests, choosing test libraries, setting up test environment, reviewing test structure. |

### Dependency Reference

| File | Title | Description | When to load |
|------|-------|-------------|--------------|
| `references/bappi/dependency-stack.md` | Canonical Dependency Stack | Complete opinionated list of packages Bappi uses — mobile, tooling, backend — with versions, purposes, and what each replaces. | Starting a new project, choosing between libraries, adding a dependency, checking if a package is in the stack. |

---

## `references/kitten/`

Kitten-specific references — persona and communication behavior only. These govern how Kitten behaves and communicates.

| File | Title | Description | When to load |
|------|-------|-------------|--------------|
| `references/kitten/communication-style.md` | Communication Style | How Kitten communicates — tone adaptation, clarification patterns, disagreement style, and attribution rules. | Every session where tone matters — code reviews, architecture discussions, explaining a decision. |

---

## `references/stack/`

Bappi's tool opinions and verdicts — a standalone knowledge category.

| File | Title | Description | When to load |
|------|-------|-------------|--------------|
| `references/stack/stack.md` | Stack Opinions | Bappi's tool choices and verdicts across mobile, web, state management, backend, tooling, observability, CI/CD, and testing. | When comparing tools, evaluating a dependency choice, or making a tech decision. |

---

## `references/patterns/`

Production-ready code patterns — a standalone knowledge category.

| File | Title | Description | When to load |
|------|-------|-------------|--------------|
| `references/patterns/patterns.md` | Code Patterns | Fetch abstraction layer, race-condition-safe token refresh, Zustand stores, TanStack Query setup, MMKV persistence, design tokens, XState machines, and TypeScript utilities. | When writing or reviewing implementation code — API calls, state, tokens, storage, or complex flows. |

---

## `references/architecture/`

Project structure and architecture patterns — a standalone knowledge category.

| File | Title | Description | When to load |
|------|-------|-------------|--------------|
| `references/architecture/architecture.md` | Architecture Patterns | Feature-based folder structure, lib-style structure, Turborepo monorepo, design token architecture, typed env config, cross-platform sharing, and API layer separation. | When discussing project structure, folder layout, monorepo design, or system architecture. |

---

## `references/composition-patterns/`

React component architecture rules — 8 rules covering props, variants, state sharing, and composition.

| File | Description |
|------|-------------|
| `references/composition-patterns/_overview.md` | Summary of all 8 rules with impact levels. **Read this first** to identify which specific rule files to fetch. |

Load the `_overview.md`, identify the 1–3 rules that apply, then fetch only those files.

**When to use:** Designing or reviewing React component APIs — boolean props, compound components, render props, context interfaces, state lifting.

---

## `references/react-best-practices/`

React and Next.js performance rules — 50+ rules across async, bundle, client, re-render, rendering, JavaScript, server, and advanced sections.

| File | Description |
|------|-------------|
| `references/react-best-practices/_overview.md` | Summary of all 50+ rules organized by section with impact levels. **Read this first** to identify which specific rule files to fetch. |

Load the `_overview.md`, identify the 1–3 rules that apply, then fetch only those files.

**When to use:** React / Next.js code — re-renders, bundle size, async patterns, server rendering, data fetching, JS performance.

---

## `references/react-native-skills/`

React Native and Expo performance rules — 40+ rules across rendering, lists, animation, scroll, navigation, state, UI, monorepo, and fonts sections.

| File | Description |
|------|-------------|
| `references/react-native-skills/_overview.md` | Summary of all 40+ rules organized by section with impact levels. **Read this first** to identify which specific rule files to fetch. |

Load the `_overview.md`, identify the 1–3 rules that apply, then fetch only those files.

**When to use:** React Native / Expo code — lists, animations, navigation, UI components, state architecture, monorepo setup.

---

## Quick Routing

| Task type | What to load |
|-----------|-------------|
| Identity / who is Bappi | `bappi/profile.md` |
| Planning or reasoning approach | `bappi/thinking.md` |
| Voice and tone calibration | `bappi/writing-style.md` + `kitten/communication-style.md` |
| Code review (any) | `bappi/code-review.md` + relevant rule `_overview.md` |
| Project / folder structure | `bappi/folder-structure.md` |
| API / fetch / network layer | `bappi/api-layer.md` |
| Zustand / client state | `bappi/state-management.md` |
| TanStack Query / data fetching | `bappi/server-state.md` |
| Auth — login, logout, tokens | `bappi/auth-flow.md` |
| Navigation / Expo Router | `bappi/navigation.md` |
| Zod schemas / form validation | `bappi/schema-validation.md` |
| Storage (tokens, AsyncStorage) | `bappi/storage.md` |
| Environment variables | `bappi/env-config.md` |
| UI components / theme | `bappi/ui-patterns.md` |
| Tooling (Biome, Husky, commits) | `bappi/tooling.md` |
| Monorepo / Turborepo | `bappi/monorepo.md` |
| NestJS backend | `bappi/backend.md` |
| Next.js / web | `bappi/nextjs.md` |
| CI/CD / EAS / Jenkins | `bappi/cicd.md` |
| Debugging | `bappi/debugging.md` |
| Testing | `bappi/testing.md` |
| Which library to use | `bappi/dependency-stack.md` |
| Tool or tech decision (opinions) | `stack/stack.md` |
| React component architecture | `composition-patterns/_overview.md` |
| React / Next.js performance | `react-best-practices/_overview.md` |
| React Native performance | `react-native-skills/_overview.md` |

---

As new reference files or libraries are added to `references/`, they will appear in this file with their path, description, and loading guidance.
