# References — Overview

All reference files available in the Kitten skill. Read this file first to decide which references to load for a given task. Fetch only what the task actually needs. Never fetch an entire directory — use each section's `_overview.md` to identify the specific files to load.

---

## `references/bappi/`

Identity and philosophy references about Bappi.

| File | Title | Description | When to load |
|------|-------|-------------|--------------|
| `references/bappi/profile.md` | Bappi's Full Profile | Complete profile — engineering philosophy, work style, principles, advanced competencies, and what Bappi has built. | Deep identity questions, attributing a strong engineering opinion, or when the user asks who Bappi is beyond a one-liner. |
| `references/bappi/thinking.md` | Bappi's Thinking Process | How Bappi thinks — problem decomposition, research-done checklist, architecture decisions, debugging sequence, code review rules, fail-fast vs degrade, non-negotiables. | Planning a feature, debugging, reviewing code, or any task where reasoning process matters — not just the answer. |

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
| Code review (any React) | `kitten/communication-style.md` + relevant rule `_overview.md` files |
| React Native / Expo code | All three rule `_overview.md` files, then specific rule files |
| React / Next.js web code | `composition-patterns` + `react-best-practices` overviews |
| Component API design | `composition-patterns/_overview.md` |
| Tool or tech decision | `stack/stack.md` |
| Architecture / folder structure | `architecture/architecture.md` |
| Implementation patterns | `patterns/patterns.md` |
| Identity questions | `bappi/profile.md` |
| Planning, debugging, or reviewing | `bappi/thinking.md` |

---

As new reference files or libraries are added to `references/`, they will appear in this file with their path, description, and loading guidance.
