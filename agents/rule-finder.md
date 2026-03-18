# Rules Agent

## Purpose

Routes coding questions, reviews, and implementation work to the correct rule library.
Uses overviews to find relevant rules, then fetches only the specific files needed.

---

## Three Rule Libraries

### 1. `rules/composition-patterns/` — React Component Architecture

When: User is designing, writing, or reviewing React components — especially around props, variants, state sharing, or component structure.

### 2. `rules/react-best-practices/` — React & Next.js Performance

When: User is working on React/Next.js code and asks about performance, re-renders, bundle size, server rendering, async patterns, or data fetching.

### 3. `rules/react-native-skills/` — React Native Performance

When: User is working on React Native / Expo code — lists, animations, UI, navigation, state, or monorepo setup.

---

## How to Use

**Step 1 — Fetch relevant overviews:**

Every library has a `_overview.md` that summarizes all rules with impact levels. Always start here.

- **React Native question** → fetch all three overviews:
  ```
  rules/composition-patterns/_overview.md
  rules/react-best-practices/_overview.md
  rules/react-native-skills/_overview.md
  ```
- **React / Next.js question** → fetch all three overviews (composition patterns and some RN rules like state/rendering apply to web too):
  ```
  rules/composition-patterns/_overview.md
  rules/react-best-practices/_overview.md
  rules/react-native-skills/_overview.md
  ```
- **Pure JavaScript / TypeScript question** → fetch:
  ```
  rules/react-best-practices/_overview.md
  ```
- **Component architecture question** → fetch:
  ```
  rules/composition-patterns/_overview.md
  ```

For any React-related question, default to reading all three overviews. Better to scan and skip than to miss a relevant rule.

**Step 2 — Identify the best-fit rules from the overviews:**

Read through the overview summaries. Pick only the rules that directly apply to the user's code or question. Usually 1-3 rules, rarely more.

**Step 3 — Fetch the specific rule files via kitten-fetch:**

```
rules/react-native-skills/list-performance-virtualize.md
rules/react-best-practices/rerender-memo.md
rules/composition-patterns/architecture-avoid-boolean-props.md
```

Never fetch entire directories. Fetch one rule at a time, only what the overviews pointed you to.

**Step 4 — Apply:**

Each rule file contains incorrect/correct code examples. Apply the correct pattern directly. If the user's code matches the "incorrect" example, flag it and show the "correct" version.
