# Rules Agent

## Purpose

Routes coding questions, reviews, and implementation work to the correct rule library.
Fetches only the specific rule files needed — never the whole library.

---

## Three Rule Libraries

### 1. `rules/composition-patterns/` — React Component Architecture

When: User is designing, writing, or reviewing React components — especially around props, variants, state sharing, or component structure.

Sections and their filename prefixes:
| Prefix | Section | Impact |
|--------|---------|--------|
| `architecture-` | Component Architecture | HIGH |
| `state-` | State Management | MEDIUM |
| `patterns-` | Implementation Patterns | MEDIUM |
| `react19-` | React 19 APIs | MEDIUM |

Files:
- `architecture-avoid-boolean-props.md` — boolean props creating exponential states
- `architecture-compound-components.md` — compound component pattern
- `state-context-interface.md` — context with interface pattern
- `state-decouple-implementation.md` — decoupling state from implementation
- `state-lift-state.md` — lifting state for composition
- `patterns-children-over-render-props.md` — children over render props
- `patterns-explicit-variants.md` — explicit variant components
- `react19-no-forwardref.md` — drop forwardRef in React 19

---

### 2. `rules/react-best-practices/` — React & Next.js Performance

When: User is working on React/Next.js code and asks about performance, re-renders, bundle size, server rendering, async patterns, or data fetching.

Sections and their filename prefixes:
| Prefix | Section | Impact |
|--------|---------|--------|
| `async-` | Eliminating Waterfalls | CRITICAL |
| `bundle-` | Bundle Size Optimization | CRITICAL |
| `server-` | Server-Side Performance | HIGH |
| `client-` | Client-Side Data Fetching | MEDIUM-HIGH |
| `rerender-` | Re-render Optimization | MEDIUM |
| `rendering-` | Rendering Performance | MEDIUM |
| `js-` | JavaScript Performance | LOW-MEDIUM |
| `advanced-` | Advanced Patterns | LOW |

Key files to know:
- `async-parallel.md`, `async-defer-await.md` — waterfall elimination
- `bundle-dynamic-imports.md`, `bundle-barrel-imports.md` — bundle size
- `rerender-memo.md`, `rerender-no-inline-components.md` — re-render prevention
- `server-parallel-fetching.md`, `server-cache-react.md` — server perf

---

### 3. `rules/react-native-skills/` — React Native Performance

When: User is working on React Native / Expo code — lists, animations, UI, navigation, state, or monorepo setup.

Sections and their filename prefixes:
| Prefix | Section | Impact |
|--------|---------|--------|
| `rendering-` | Core Rendering | CRITICAL |
| `list-performance-` | List Performance | HIGH |
| `animation-` | Animation | HIGH |
| `scroll-` | Scroll Performance | HIGH |
| `navigation-` | Navigation | HIGH |
| `react-state-` | React State | MEDIUM |
| `state-` | State Architecture | MEDIUM |
| `react-compiler-` | React Compiler | MEDIUM |
| `ui-` | User Interface | MEDIUM |
| `design-system-` | Design System | MEDIUM |
| `monorepo-` | Monorepo | LOW |
| `imports-` | Third-Party Dependencies | LOW |
| `js-` | JavaScript | LOW |
| `fonts-` | Fonts | LOW |

Key files to know:
- `list-performance-virtualize.md` — always virtualize lists
- `animation-gpu-properties.md`, `animation-derived-value.md` — Reanimated patterns
- `rendering-no-falsy-and.md`, `rendering-text-in-text-component.md` — RN rendering rules
- `ui-expo-image.md`, `ui-pressable.md`, `ui-native-modals.md` — native UI patterns
- `navigation-native-navigators.md` — native stack/tabs

---

## How to Use

**Step 1 — Identify which library applies:**
- React component structure → composition-patterns
- React/Next.js perf → react-best-practices
- React Native / Expo → react-native-skills
- Code touches multiple → fetch from each as relevant

**Step 2 — Identify the section by topic:**
Match the topic to the section prefix table above.

**Step 3 — Fetch only the relevant file(s) via kitten-fetch:**

Use the same kitten-fetch mechanism defined in the skill. Fetch one rule file at a time:

```
rules/react-native-skills/list-performance-virtualize.md
rules/react-best-practices/rerender-memo.md
rules/composition-patterns/architecture-avoid-boolean-props.md
```

Never fetch entire directories. One rule at a time, only what applies.

**Step 4 — Apply:**
Each rule file contains incorrect/correct code examples. Apply the correct pattern directly. If the user's code matches the "incorrect" example, flag it and show the "correct" version.
