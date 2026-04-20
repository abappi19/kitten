# Project Bootstrap Agent

Bappi's step-by-step sequence for starting a new project from scratch. Each step asks one question, delegates to the relevant reference or agent for decision criteria, then moves to the next. No step is skipped. No code is written until all decisions in Phase 1 are confirmed.

**Persistence:** all bootstrap output is written to `.planning/initial-setup/` per `references/kitten/planning-directory.md`. Slug defaults to `initial-setup`.

---

## Step 0 — WIP Continuation Check

Run the WIP Continuation Check from `agents/planner.md` before anything else. If an in-progress initiative exists in `.planning/PLAN.md`, resolve it (resume / fresh start / start new) before proceeding with bootstrap.

---

## Phase 1 — Decisions

Ask one at a time. Wait for the answer before moving to the next.

**Planning beat** — defined in `agents/planner.md` (Universal Rule), applies here without exception. Say `planning next move...` before every question and after every answer.

---

### Step 1 — Package Manager

planning next move...

> Which package manager are you using?
>
> **[B]** bun `bunx` **[N]** npm `npx` **[Y]** yarn `yarn dlx` **[P]** pnpm `pnpm dlx`
>
> Bappi defaults to `bun` for new standalone apps — shifts to `pnpm` for native+web monorepos and `yarn` 4 for cross-platform monorepos.

→ On answer: say `planning next move...` → store as `{pkg}` → proceed to Step 2
→ Reference: `references/bappi/tooling.md` for full preference table and project-type guidance

---

### Step 2 — Project Type

planning next move...

> What kind of project is this?
>
> **[E]** Expo Managed Workflow (React Native)
> **[B]** Expo Bare (React Native, custom native)
> **[M]** Turborepo Monorepo (RN + web/backend)
> **[N]** Next.js only (web)
> **[S]** Node.js backend only

→ On answer: say `planning next move...` → store as `{project_type}` → proceed to Step 3
→ Reference: `references/bappi/folder-structure.md` for structure options per type

---

### Step 3 — Project Name

planning next move...

> What's the project name?

→ On answer: say `planning next move...` → store as `{project_name}` (kebab-case for CLI, PascalCase for display) → proceed to Step 4

---

### Step 4 — Navigation _(Expo/RN only — skip for Next.js or backend-only)_

planning next move...

> Which navigation setup?
>
> **[E]** Expo Router (file-based, default)
> **[R]** React Navigation (manual setup)

→ On answer: say `planning next move...` → store as `{navigation}` → proceed to Step 5
→ Reference: `references/bappi/navigation.md` for trade-offs and setup guidance

---

### Step 5 — Folder Structure

planning next move...

> Which folder structure?
>
> **[L]** Lib-style (`app/` + `lib/`) — Bappi's default for standalone apps
> **[F]** Feature-based (`features/` top-level, shared in `shared/`)
> **[M]** Monorepo lib-style (`apps/` + `packages/`) — for monorepos

→ On answer: say `planning next move...` → store as `{folder_structure}` → proceed to Step 6
→ Reference: `references/bappi/folder-structure.md` for the full structure trees and file suffix conventions

---

### Step 6 — Client State

planning next move...

> Client state management?
>
> **[Z]** Zustand (default)
> **[J]** Jotai
> **[R]** Redux Toolkit
> **[N]** None

→ On answer: say `planning next move...` → store as `{client_state}` → proceed to Step 7
→ Reference: `references/bappi/state-management.md` for Bappi's patterns and store setup

---

### Step 7 — Server State

planning next move...

> Server state / data fetching?
>
> **[T]** TanStack Query (default)
> **[C]** Custom cache layer
> **[N]** None

→ On answer: say `planning next move...` → store as `{server_state}` → proceed to Step 8
→ Reference: `references/bappi/server-state.md` for QueryClient config, persister, and key factory setup

---

### Step 8 — UI Library _(Expo/RN or monorepo — skip for backend-only)_

planning next move...

> UI component library?
>
> **[N]** None (custom primitives only)
> **[T]** Tamagui
> **[G]** Gluestack UI
> **[P]** React Native Paper

→ On answer: say `planning next move...` → store as `{ui_lib}` → proceed to Step 9
→ Reference: `references/bappi/ui-patterns.md` for primitives, theme tokens, and library setup

---

### Step 9 — Fonts _(Expo/RN only)_

planning next move...

> Custom fonts or system fonts?
>
> **[S]** System fonts (skip font setup)
> **[C]** Custom fonts

If **[C]**: Which font family? (ask — store as `{font_family}`)

→ On answer: say `planning next move...` → store font choice → proceed to Step 10
→ Reference: `references/bappi/ui-patterns.md` for expo-font setup and splash screen loading strategy

---

### Step 10 — Icons _(Expo/RN only)_

planning next move...

> Icon pack?
>
> **[H]** HugeIcons
> **[E]** Expo Vector Icons
> **[S]** Custom SVGs (react-native-svg)
> **[N]** None yet

→ On answer: say `planning next move...` → store as `{icons}` → proceed to Step 11
→ Reference: `references/bappi/dependency-stack.md` for the package to install

---

### Step 11 — Tooling

planning next move...

> Lint and format tooling?
>
> **[E]** ESLint + Prettier (default)
> **[B]** Biome (single-tool alternative)

→ On answer: say `planning next move...` → store as `{tooling}` → proceed to Step 12
→ Reference: `references/bappi/tooling.md` for the full config — ESLint flat config, Prettier settings, lint-staged, Husky hooks, commitlint setup

---

### Step 12 — Testing

planning next move...

> Testing setup?
>
> **[J]** Jest + Detox/Maestro (RN default)
> **[V]** Vitest + Playwright (web/Node default)
> **[S]** Skip for now

→ On answer: say `planning next move...` → store as `{testing}` → proceed to Step 13
→ Reference: `references/bappi/testing.md` for test runner config, MSW setup, and E2E choice

---

### Step 13 — Auth

planning next move...

> Will this project need authentication?
>
> **[Y]** Yes
> **[N]** No

→ On answer: say `planning next move...` → store as `{needs_auth}` → proceed to Step 14
→ If **[Y]**: Reference `references/bappi/auth-flow.md` for token management, AuthProvider, and route guard setup

---

### Step 14 — Environment Config

planning next move...

> Will there be environment-specific config (dev/staging/prod)?
>
> **[Y]** Yes
> **[N]** No

→ On answer: say `planning next move...` → store env config choice → proceed to Step 15
→ If **[Y]**: Reference `references/bappi/env-config.md` for `getEnvVars()` factory and EAS build profile env setup

---

### Step 15 — Backend _(skip if project_type is backend-only — already decided)_

planning next move...

> Backend?
>
> **[H]** Hono.js (Bappi's preferred lightweight)
> **[N]** Next.js API Routes (if Next.js is already in use)
> **[E]** Express
> **[X]** NestJS (microservices / complex server)
> **[S]** Skip / external API only

→ On answer: say `planning next move...` → store as `{backend}` → proceed to Step 16
→ Reference: `references/bappi/backend.md` for NestJS patterns, `references/stack/stack.md` for Bappi's verdicts on each

---

### Step 16 — CI/CD & EAS _(Expo/RN only)_

planning next move...

> Set up EAS build profiles and CI/CD?
>
> **[Y]** Yes — EAS dev/preview/production + GitHub Actions
> **[S]** Skip for now

→ On answer: say `planning next move...` → store CI/CD choice → proceed to Step 17
→ If **[Y]**: Reference `references/bappi/cicd.md` for EAS build profiles and GitHub Actions pipeline

---

### Step 17 — BMad

planning next move...

> Install BMad for structured planning?
>
> **[Y]** Yes
> **[N]** No

→ On answer: say `planning next move...` → store BMad choice → proceed to Phase 1 Complete
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

9. **Set up fonts** _(if custom)_ — follow `references/bappi/ui-patterns.md`

10. **Set up environment config** _(if yes)_ — follow `references/bappi/env-config.md`

11. **Set up auth scaffolding** _(if yes)_ — follow `references/bappi/auth-flow.md`

12. **Set up testing** _(if not skipped)_ — follow `references/bappi/testing.md`

13. **Set up EAS + CI/CD** _(if yes)_ — follow `references/bappi/cicd.md`

14. **Install BMad** _(if yes)_ — follow `agents/bmad-orchestrator.md`; skip Step 1 (package manager already known)

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
- **Planning beat is non-negotiable.** Defined in `agents/planner.md` — `planning next move...` before every question and after every answer. No exceptions.
