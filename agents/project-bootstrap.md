# Project Bootstrap Agent

Bappi's step-by-step sequence for starting a new project from scratch. Each step asks one question, delegates to the relevant reference or agent for decision criteria, then moves to the next. No step is skipped. No code is written until all decisions in Phase 1 are confirmed.

---

## Phase 1 — Decisions

Ask one at a time. Wait for the answer before moving to the next.

---

### Step 1 — Package Manager

> Which package manager are you using?
>
> **[B]** bun `bunx` **[N]** npm `npx` **[Y]** yarn `yarn dlx` **[P]** pnpm `pnpm dlx`

→ Store as `{pkg}` — used in every install command throughout bootstrap
→ Reference: `references/bappi/tooling.md` for Bappi's preference and project-type guidance

---

### Step 2 — Project Type

> What kind of project is this?
>
> **[E]** Expo Managed Workflow (React Native)
> **[B]** Expo Bare (React Native, custom native)
> **[M]** Turborepo Monorepo (RN + web/backend)
> **[N]** Next.js only (web)
> **[S]** Node.js backend only

→ Store as `{project_type}` — determines init command, folder structure, and stack
→ Reference: `references/bappi/folder-structure.md` for structure options per type

---

### Step 3 — Project Name

> What's the project name?

→ Store as `{project_name}` (kebab-case for CLI, PascalCase for display)

---

### Step 4 — Navigation *(Expo/RN only — skip for Next.js or backend-only)*

> Which navigation setup?
>
> **[E]** Expo Router (file-based, default)
> **[R]** React Navigation (manual setup)

→ Store as `{navigation}`
→ Reference: `references/bappi/navigation.md` for trade-offs and setup guidance

---

### Step 5 — Folder Structure

> Which folder structure?
>
> **[L]** Lib-style (`app/` + `lib/`) — Bappi's default for standalone apps
> **[F]** Feature-based (`features/` top-level, shared in `shared/`)
> **[M]** Monorepo lib-style (`apps/` + `packages/`) — for monorepos

→ Store as `{folder_structure}`
→ Reference: `references/bappi/folder-structure.md` for the full structure trees and file suffix conventions

---

### Step 6 — Client State

> Client state management?
>
> **[Z]** Zustand (default)
> **[J]** Jotai
> **[R]** Redux Toolkit
> **[N]** None

→ Store as `{client_state}`
→ Reference: `references/bappi/state-management.md` for Bappi's patterns and store setup

---

### Step 7 — Server State

> Server state / data fetching?
>
> **[T]** TanStack Query (default)
> **[C]** Custom cache layer
> **[N]** None

→ Store as `{server_state}`
→ Reference: `references/bappi/server-state.md` for QueryClient config, persister, and key factory setup

---

### Step 8 — UI Library *(Expo/RN or monorepo — skip for backend-only)*

> UI component library?
>
> **[N]** None (custom primitives only)
> **[T]** Tamagui
> **[G]** Gluestack UI
> **[P]** React Native Paper

→ Store as `{ui_lib}`
→ Reference: `references/bappi/ui-patterns.md` for primitives, theme tokens, and library setup

---

### Step 9 — Fonts *(Expo/RN only)*

> Custom fonts or system fonts?
>
> **[S]** System fonts (skip font setup)
> **[C]** Custom fonts

If **[C]**: Which font family? (ask — store as `{font_family}`)

→ Reference: `references/bappi/ui-patterns.md` for expo-font setup and splash screen loading strategy

---

### Step 10 — Icons *(Expo/RN only)*

> Icon pack?
>
> **[H]** HugeIcons
> **[E]** Expo Vector Icons
> **[S]** Custom SVGs (react-native-svg)
> **[N]** None yet

→ Store as `{icons}`
→ Reference: `references/bappi/dependency-stack.md` for the package to install

---

### Step 11 — Tooling

> Lint and format tooling?
>
> **[E]** ESLint + Prettier (default)
> **[B]** Biome (single-tool alternative)

→ Store as `{tooling}`
→ Reference: `references/bappi/tooling.md` for the full config — ESLint flat config, Prettier settings, lint-staged, Husky hooks, commitlint setup

---

### Step 12 — Testing

> Testing setup?
>
> **[J]** Jest + Detox/Maestro (RN default)
> **[V]** Vitest + Playwright (web/Node default)
> **[S]** Skip for now

→ Store as `{testing}`
→ Reference: `references/bappi/testing.md` for test runner config, MSW setup, and E2E choice

---

### Step 13 — Auth

> Will this project need authentication?
>
> **[Y]** Yes
> **[N]** No

→ Store as `{needs_auth}`
→ If **[Y]**: Reference `references/bappi/auth-flow.md` for token management, AuthProvider, and route guard setup

---

### Step 14 — Environment Config

> Will there be environment-specific config (dev/staging/prod)?
>
> **[Y]** Yes
> **[N]** No

→ If **[Y]**: Reference `references/bappi/env-config.md` for `getEnvVars()` factory and EAS build profile env setup

---

### Step 15 — Backend *(skip if project_type is backend-only — already decided)*

> Backend?
>
> **[H]** Hono.js (Bappi's preferred lightweight)
> **[N]** Next.js API Routes (if Next.js is already in use)
> **[E]** Express
> **[X]** NestJS (microservices / complex server)
> **[S]** Skip / external API only

→ Store as `{backend}`
→ Reference: `references/bappi/backend.md` for NestJS patterns, `references/stack/stack.md` for Bappi's verdicts on each

---

### Step 16 — CI/CD & EAS *(Expo/RN only)*

> Set up EAS build profiles and CI/CD?
>
> **[Y]** Yes — EAS dev/preview/production + GitHub Actions
> **[S]** Skip for now

→ If **[Y]**: Reference `references/bappi/cicd.md` for EAS build profiles and GitHub Actions pipeline

---

### Step 17 — BMad

> Install BMad for structured planning?
>
> **[Y]** Yes
> **[N]** No

→ If **[Y]**: Follow `agents/bmad-orchestrator.md` — package manager already decided in Step 1, skip that question there

---

## Phase 1 Complete — Confirm Before Proceeding

Before writing any code or running any command, present a summary of every decision made:

```
Project: {project_name}
Type: {project_type}
Package manager: {pkg}
Navigation: {navigation}
Folder structure: {folder_structure}
Client state: {client_state}
Server state: {server_state}
UI library: {ui_lib}
Fonts: {font_family or system}
Icons: {icons}
Tooling: {tooling}
Testing: {testing}
Auth: {needs_auth}
Env config: yes/no
Backend: {backend}
EAS/CI: yes/no
BMad: yes/no
```

> Everything look right? **[Y]** Yes, proceed **[E]** Edit a decision

Wait for confirmation before Phase 2.

---

## Phase 2 — Scaffold

Execute in order. Reference the linked file for each step's implementation details.

1. **Init project** — run the create command with `{pkg}` and `{project_name}`
   - Expo Managed: `{pkg} create-expo-app {project_name}`
   - Next.js: `{pkg} create-next-app {project_name}`
   - Monorepo: `{pkg} create-turbo {project_name}`

2. **Install canonical dependencies** — filter `references/bappi/dependency-stack.md` by the decisions made; install only what applies

3. **Set up folder structure** — follow `references/bappi/folder-structure.md` for the chosen structure; create the full directory tree and stub files

4. **Set up tooling** — follow `references/bappi/tooling.md` for the full config (ESLint or Biome, Husky, lint-staged, commitlint, `package.json` scripts)

5. **Set up navigation** — follow `references/bappi/navigation.md`

6. **Set up client state** — follow `references/bappi/state-management.md`

7. **Set up server state** — follow `references/bappi/server-state.md`

8. **Set up UI library** — follow `references/bappi/ui-patterns.md`

9. **Set up fonts** *(if custom)* — follow `references/bappi/ui-patterns.md`

10. **Set up environment config** *(if yes)* — follow `references/bappi/env-config.md`

11. **Set up auth scaffolding** *(if yes)* — follow `references/bappi/auth-flow.md`

12. **Set up testing** *(if not skipped)* — follow `references/bappi/testing.md`

13. **Set up EAS + CI/CD** *(if yes)* — follow `references/bappi/cicd.md`

14. **Install BMad** *(if yes)* — follow `agents/bmad-orchestrator.md`; skip Step 1 (package manager already known)

---

## Phase 3 — Verify

Run before the first commit:

```bash
# Type check
{pkg_cmd} tsc --noEmit

# Lint
{pkg_cmd} lint
```

Fix anything that surfaces. Then:

→ Follow `agents/committer.md` for the initial commit

---

## Rules

- **One decision at a time.** Never stack multiple questions in one message.
- **No code before confirmation.** Phase 2 starts only after Phase 1 is confirmed.
- **Reference files drive implementation.** Never improvise — if a reference exists for the step, follow it.
- **Package manager flows through everything.** `{pkg}` from Step 1 applies to every install command in Phase 2.
- **BMad skips Step 1 of bmad-orchestrator.** Package manager is already known — pass it directly.
