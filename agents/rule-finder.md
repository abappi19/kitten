# Rules Agent

## Purpose

Routes coding questions, reviews, and implementation work to the correct reference library.
Uses overviews to find relevant references, then fetches only the specific files needed.

---

## Step 0 — Read the top-level overview first

Fetch `references/_overview.md` to see all available reference libraries and their routing guidance. Use this to determine which libraries apply before fetching any library-specific overviews.

---

## Three Reference Libraries (Code Rules)

### 1. `references/composition-patterns/` — React Component Architecture

When: User is designing, writing, or reviewing React components — especially around props, variants, state sharing, or component structure.

### 2. `references/react-best-practices/` — React & Next.js Performance

When: User is working on React/Next.js code and asks about performance, re-renders, bundle size, server rendering, async patterns, or data fetching.

### 3. `references/react-native-skills/` — React Native Performance

When: User is working on React Native / Expo code — lists, animations, UI, navigation, state, or monorepo setup.

---

## How to Use

**Step 1 — Fetch relevant overviews:**

Every library has a `_overview.md` that summarizes all rules with impact levels. Always start here. Fetch all that apply in one command.

- **React Native question** → fetch all three in one call:
  ```bash
  python3 -m scripts.k_load references/composition-patterns/_overview.md references/react-best-practices/_overview.md references/react-native-skills/_overview.md
  ```
- **React / Next.js question** → fetch all three in one call (composition patterns and some RN rules like state/rendering apply to web too):
  ```bash
  python3 -m scripts.k_load references/composition-patterns/_overview.md references/react-best-practices/_overview.md references/react-native-skills/_overview.md
  ```
- **Pure JavaScript / TypeScript question** → fetch:
  ```bash
  python3 -m scripts.k_load references/react-best-practices/_overview.md
  ```
- **Component architecture question** → fetch:
  ```bash
  python3 -m scripts.k_load references/composition-patterns/_overview.md
  ```

For any React-related question, default to reading all three overviews. Better to scan and skip than to miss a relevant rule.

**Step 2 — Identify the best-fit rules from the overviews:**

Read through the overview summaries. Pick only the rules that directly apply to the user's code or question. Usually 1-3 rules, rarely more.

**Step 3 — Fetch the specific rule files via kitten-fetch:**

Fetch all relevant rule files in one command:
```bash
python3 -m scripts.k_load references/react-native-skills/list-performance-virtualize.md references/react-best-practices/rerender-memo.md references/composition-patterns/architecture-avoid-boolean-props.md
```

Never fetch entire directories. Fetch only what the overviews pointed you to — 1–3 files at most, all in one call.

**Step 4 — Apply:**

Each rule file contains incorrect/correct code examples. Apply the correct pattern directly. If the user's code matches the "incorrect" example, flag it and show the "correct" version.
