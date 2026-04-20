<!-- references/kitten/planning-directory.md -->

---

title: Planning Directory Convention
description: Canonical layout for persisting plans. Every non-trivial plan — Feature Plans, Creation Lifecycle, project bootstrap, refinement spec — is written to `.planning/` at the project root with a minimal index, one subfolder per initiative, and one file per phase. Status is tracked per initiative. Completed initiatives are archived, not deleted.
type: reference

---

# Planning Directory Convention

One directory. Every plan lives there. No plan is left in-session only.

---

## Location

`.planning/` always lives at the project root. Same path in both Normal Mode and Contributor Mode — the directory is project-owned, not mode-owned.

`_kitten-bot/` (gitignored scratchpad for single-file code drafts) and `wip/` (Contributor Mode skill-file draft→review→apply workflow) coexist with `.planning/`. They serve different purposes and never contain plans.

---

## Structure

```
.planning/
├── PLAN.md                        ← minimal index (one row per initiative)
├── [initiative-slug]/
│   ├── PLAN.md                    ← detailed plan (problem → approach → steps)
│   └── phases/                    ← omitted for small initiatives (see below)
│       ├── phase-01-[name].md
│       ├── phase-02-[name].md
│       └── ...
├── [another-initiative]/
│   ├── PLAN.md
│   └── phases/
│       └── ...
└── archive/                       ← optional; completed initiatives moved here on explicit user request
    └── [completed-initiative]/
        └── ...
```

- `initiative-slug` is short, kebab-case, derived from the feature name (e.g. `monorepo-conversion`, `offline-sync`, `auth-rewrite`).
- Every initiative has its own folder, even when small.
- `phases/` is present only for multi-phase initiatives (see "Small initiative escape hatch" below).

---

## Index — `.planning/PLAN.md`

Minimal. One table, one opening line, nothing else.

```md
# [Project Name] — Planning Index

One-line tagline for the project.

| Plan                                | Status      | Link                                                       |
| ----------------------------------- | ----------- | ---------------------------------------------------------- |
| Initial build — [short description] | done        | [initial-setup/PLAN.md](initial-setup/PLAN.md)             |
| [Initiative name]                   | in-progress | [monorepo-conversion/PLAN.md](monorepo-conversion/PLAN.md) |
| [Initiative name]                   | planned     | [next-thing/PLAN.md](next-thing/PLAN.md)                   |
```

Status values: `planned`, `in-progress`, `done`, `archived`.

**Project name derivation** (write once when the index is first created; never re-derive):

1. `package.json` → `name` field, if present
2. else `src-tauri/tauri.conf.json` → `productName`, if present
3. else directory basename at the project root
4. Strip scope prefixes (`@org/`) and normalize to Title Case

The index never carries detail. Anything beyond a single link row belongs inside the initiative's own `PLAN.md`.

---

## Initiative plan — `.planning/[slug]/PLAN.md`

Full Feature Plan structure. `**Status:**` line directly under the title. Uses either a `## Phase Index` (multi-phase) or a `## Tasks` checkbox list (small initiative).

```md
# [Initiative Name]

**Started:** YYYY-MM-DD
**Status:** in-progress

---

## Problem

...

## Constraints

...

## Approach

...

## Target Structure ← optional, when restructuring the codebase

...

## Risks & Edge Cases

...

## Phase Index ← for multi-phase initiatives

| #   | Phase                                                             | Status  |
| --- | ----------------------------------------------------------------- | ------- |
| 1   | [Workspace scaffolding](phases/phase-01-workspace-scaffolding.md) | planned |
| 2   | [Shared tsconfig](phases/phase-02-shared-tsconfig.md)             | planned |
| ... | ...                                                               | ...     |

## Tasks ← for small initiatives (replaces Phase Index)

- [ ] First concrete step
- [ ] Second step
- [ ] ...

## Open Questions

...
```

### Small initiative escape hatch

When an initiative has **< 3 implementation steps** AND **touches ≤ 2 layers** (e.g. a single hook + a single component, with no state/API/navigation cross-cutting), skip the phase breakdown:

- Keep steps in `## Tasks` (checkbox list) inside the initiative's own `PLAN.md`
- Omit the `phases/` directory entirely
- Index row status is tracked the same way

This keeps small changes from generating bureaucratic overhead. The initiative folder still exists so the plan is persistent and resumable.

---

## Phase file — `.planning/[slug]/phases/phase-XX-[name].md`

One file per phase. Numbered zero-padded to two digits so they sort correctly.

```md
# Phase [N] — [Phase Name]

**Status:** planned | in-progress | done

## Goal

One paragraph — what this phase delivers and why.

## Scope

What's in, what's deliberately out.

## Steps

1. First concrete step
2. Second step
3. ...

## Verification

How we know the phase is complete.
```

Phase files stay short. They are working documents, not architecture essays. If a phase needs extensive background, link out to the initiative's `PLAN.md` instead of duplicating.

### Phase numbering & insertion

- **Default:** zero-padded two-digit sequential (`phase-01-*.md`, `phase-02-*.md`).
- **Structural insertion** (new phase between existing ones, planned work): renumber — shift subsequent phases by one, rename files, update the `## Phase Index` table. Use `git mv` where applicable.
- **Urgent patch to an in-flight phase** (hotfix, minor scope add that can't wait for renumber): use a decimal suffix (`phase-02a-hotfix.md`). The suffix signals "not canonical sequence" at a glance.
- Default to renumber. Decimal suffix is the exception.

---

## Lifecycle

### Creating a new initiative

When the planner completes a Feature Plan, enters Creation Lifecycle, or runs project-bootstrap:

1. **Derive `[slug]`** from the feature name (short, kebab-case).
2. **Collision check:** if `.planning/[slug]/` already exists, append `-v2` (or next integer: `-v3`, `-v4`) and note `(continues [original-slug])` in the index row.
3. **Create the initiative folder:**
    - `.planning/[slug]/PLAN.md` with the locked plan content.
    - For multi-phase: one phase file per step under `.planning/[slug]/phases/`.
    - For small initiatives (< 3 steps, ≤ 2 layers): `## Tasks` inside `PLAN.md`, no `phases/`.
4. **Update or create `.planning/PLAN.md`** — the minimal index. Add a row with status `in-progress`. If the index doesn't exist yet, create it with the project name (per derivation rules) + one-line tagline + the first row.

### During execution

- Update the current phase file's `**Status:**` as work progresses.
- Check off `## Tasks` entries inside the phase file or the initiative `PLAN.md` as they complete.
- If scope changes mid-flight, update the initiative `PLAN.md` first, then the affected phase files. Never silently drift.

### Completing an initiative

- When the Feature Plan DoD passes:
    - Set the initiative `PLAN.md` `**Status:**` to `done`.
    - Update the matching row in `.planning/PLAN.md` to `done`.
    - Set each completed phase file's `**Status:**` to `done`.
- Do not delete the folder. `done` plans are the project's history.

### Archiving

User can request `"archive [initiative]"`:

- Prefer `git mv .planning/[slug] .planning/archive/[slug]` when the project is a git repo **and** the folder is tracked by git.
- Fall back to `mv .planning/[slug] .planning/archive/[slug]` for untracked folders or non-git projects.
- Update the index row status to `archived`.

---

## Existing `.planning/` detection

On the first code task in a session, if `.planning/` exists:

- **Conforming shape** (contains `PLAN.md` with the expected table schema) → proceed normally.
- **Non-conforming shape** (no `PLAN.md` at root, or `PLAN.md` without the three-column `| Plan | Status | Link |` table) → halt and ask once:

    > _"A `.planning/` directory exists but doesn't match the Kitten convention. How should I handle it?"_
    > **[M]** Migrate to Kitten convention (preserves content, reshapes structure)
    > **[K]** Keep existing shape (skip all `.planning/` conventions for this project)
    > **[V]** View what's there first

- `[M]` → propose a migration plan (new folder layout preserving all existing content), apply on confirmation.
- `[K]` → set `planning_convention: "custom"` in session memory; skip CX_R18 enforcement for this session.
- `[V]` → list the current structure; re-ask.

Record the decision for the session — never re-ask within the same session.

---

## When this applies

| Flow                                       | Persist to `.planning/`?                                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| Feature Plan (non-trivial feature)         | Yes                                                                                |
| Creation Lifecycle (module, library, etc.) | Yes — each lifecycle phase becomes a phase file                                    |
| Project Bootstrap (new app)                | Yes — slug defaults to `initial-setup`                                             |
| Observation Intake / refinement spec       | Yes — default: appended phase; new initiative only when scope warrants (see below) |
| Tactical Plan (single-file, contained)     | No — stays internal, uses `_kitten-bot/` draft gate only                           |
| Commit, review, identity, patterns query   | No                                                                                 |

### Refinement spec routing (Observation Intake)

When Observation Intake produces a refinement spec:

- **Default:** append as a new phase to the parent initiative — `phases/phase-NN-refinement-[topic].md`. Update the `## Phase Index` in the initiative `PLAN.md`.
- **Escalate to a new initiative** when any of:
    - The refinement touches 3+ distinct layers
    - It requires a new external dependency (package, service, API)
    - It changes the core approach of the parent initiative

    In those cases, create a new sibling initiative and link back to the parent in its `PLAN.md` Problem section.

Planner decides silently and applies the default; mentions the choice only if the user overrides.

---

## WIP Continuation integration

Runs at the start of every Tactical Plan, Feature Plan, Creation Lifecycle Phase 1, and project-bootstrap step 0.

```bash
cat $KITTEN_PROJECT_DIR/.planning/PLAN.md 2>/dev/null
cat $KITTEN_PROJECT_DIR/wip/wip.md 2>/dev/null
```

Two sources checked:

1. **`.planning/PLAN.md`** — any row with status `in-progress`.
2. **`wip/wip.md`** — any row with status `in-progress` (Contributor Mode skill-file drafts only).

### Multiple in-progress rows

If more than one `in-progress` row exists, list them numbered and ask which to resume:

```
In-progress plans:
  1. Monorepo conversion (.planning/monorepo-conversion/)
  2. Offline sync (.planning/offline-sync/)

Resume which? Enter a number, or:
  [F] Fresh start (archive all listed)
  [N] Start something new (leave them in place)
```

On a numeric choice: read that initiative's `PLAN.md` + `phases/` and continue from the first phase that is not `done`. Leave other in-progress entries untouched.

If a single row matches, keep the existing single-item prompt: `[R] Resume [F] Fresh start [N] Start something new`.

---

## Attribution

All Kitten-authored plan files follow this convention. Bappi wrote it because unstructured planning loses context the moment a session ends. The directory is the memory.
