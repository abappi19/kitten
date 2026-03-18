# Kitten Bot — Skill WIP

Adjustments needed to make Kitten Bot accurately represent Bappi's brain.
This file tracks structural and content gaps — not completed work.

Status key: `[ ]` not started · `[~]` in progress · `[x]` done

---

## 1. Reference Structure Reorganization

### Problem
`references/kitten/` currently holds three files that don't belong there:
- `references/kitten/patterns.md` — code patterns (fetch layer, stores, tokens, etc.)
- `references/kitten/stack.md` — tool opinions and comparisons
- `references/kitten/architecture.md` — folder structures, monorepo, design tokens

These are independent knowledge categories. `references/kitten/` should only contain files that define how **Kitten behaves** — its persona, voice, and communication rules. Knowledge about Bappi's stack, patterns, and architecture belongs in their own dedicated directories.

### What `references/kitten/` should contain
Only persona/behavior files:
- `references/kitten/communication-style.md` ✅ — stays here

### Where the misplaced files should move

| Current path | Correct path | Reason |
|---|---|---|
| `references/kitten/stack.md` | `references/stack/stack.md` | Tool opinions are a standalone knowledge category |
| `references/kitten/patterns.md` | `references/patterns/patterns.md` | Code patterns are a standalone knowledge category |
| `references/kitten/architecture.md` | `references/architecture/architecture.md` | Architecture is a standalone knowledge category |

### Tasks
- [x] Move `stack.md` → `references/stack/`
- [x] Move `patterns.md` → `references/patterns/`
- [x] Move `architecture.md` → `references/architecture/`
- [x] Update `references/_overview.md` — fix paths, add new sections
- [x] Update `SKILL.md` — fix example fetch path
- [x] `agents/rule-finder.md` — no changes needed (only references rule libraries)
- [x] Update `agents/code-reviewer.md` — fixed all three old paths

---

## 2. Communication Style — Missing Behavior

### Problem
`references/kitten/communication-style.md` describes tone but is missing two behaviors defined during the brain session:

### 2.1 Think-before-act loop `[ ]`
The core interaction behavior is not in any file Kitten will load:
1. Understand deeply first
2. Ask for clarification only if truly needed
3. Generate response internally
4. Self-validate — is this right?
5. If yes → execute. If no → ask for clarification.

**Fix:** Add this loop to `communication-style.md`.

### 2.2 Two writing modes `[ ]`
Bappi writes in two distinct modes depending on context:

**Casual / thinking mode:** lowercase start, flowing prose, comma-separated ideas, "and then" connectors, no formatting, trails off with "and so on". Typos not corrected.

**Teaching / explaining mode:** structured with bold headers + em-dash, imperative verb first, short one-line explanations, parallel structure. Capitalizes first word of each point.

Switches naturally — casual when describing his own process, structured when instructing someone.

**Fix:** Add both modes with examples to `communication-style.md`.

### 2.3 Load at session boot `[ ]`
`communication-style.md` governs every single response but is currently fetched lazily.
**Fix:** Add it to the load order in `agents/session-boot.md` — load after config init, before proceeding.

---

## 3. Bappi Reference — Missing Files

Content confirmed during the brain session but not yet written as reference files.

### 3.1 Writing style reference `[ ]`
The voice samples gathered during the session should become a dedicated reference.
Path: `references/bappi/writing-style.md`

Should include:
- Real answer examples from the session (project setup, code review, useEffect, wrong approach)
- Observed patterns annotated — what mode, what signals it
- Sentence rhythm: process-first, sequence before conclusion
- How Bappi signals agreement, disagreement, and appreciation
- Short answers when the answer is short ("zustand.")

### 3.2 Code review style `[ ]`
The code review behavior is in `thinking.md` but could be a standalone reference for the code-reviewer agent to load directly.
Path: `references/bappi/code-review.md`

Should include:
- Block vs suggest rule (wrong/unsafe → block, correct but improvable → suggest)
- Wrong approach handling (step back → high-level comment → suggest alternative → ignore small details → invite discussion)
- How to phrase comments to juniors vs seniors
- Multiple approaches + picked recommendation pattern

---

## 4. Missing Reference Categories

Files that don't exist yet but were identified as needed.

### 4.1 `references/stack/` `[ ]`
Currently just `stack.md` moved from `kitten/`. Needs `_overview.md` once moved.

### 4.2 `references/patterns/` `[ ]`
Currently just `patterns.md` moved from `kitten/`. Needs `_overview.md` once moved.

### 4.3 `references/architecture/` `[ ]`
Currently just `architecture.md` moved from `kitten/`. Needs `_overview.md` once moved.

---

## 5. Agents — Gaps

### 5.1 Communication style not loaded at boot `[ ]`
Already noted in section 2.3. Session-boot needs to fetch `communication-style.md` as part of init.

### 5.2 Agents don't reference `thinking.md` `[ ]`
`agents/planner.md` and `agents/debugger.md` should explicitly fetch `references/bappi/thinking.md` as part of their flow — it contains the exact sequences they need.

Currently neither agent references it.

---

## Priority Order

| Priority | Item |
|----------|------|
| P0 | Move stack/patterns/architecture out of `references/kitten/` |
| P0 | Add think-before-act loop + two writing modes to `communication-style.md` |
| P0 | Load `communication-style.md` at session boot |
| P1 | Add `writing-style.md` to `references/bappi/` |
| P1 | Wire `thinking.md` into planner and debugger agents |
| P2 | Add `code-review.md` to `references/bappi/` |
