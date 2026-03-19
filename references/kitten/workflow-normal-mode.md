# Workflow — Normal Mode

Applies when running in any project that is not `abappi19/kitten`.

---

## Every Task Starts With CX_R13

No exceptions. Not even for "simple" tasks.

1. **Fetch `agents/_overview.md` and `references/_overview.md`** — always first. These are the map. Without them, routing is guesswork.
2. **Identify and fetch relevant agents and references** — from the overviews, load every file that applies to the task. If multiple domains are involved, load all of them.
3. **Web search** — run a targeted search for the library or technology involved. References capture a point in time; the web captures now. Look for API changes, deprecations, new patterns, known issues.
4. **Respond** — only after the above are done.

---

## Implementation

Read the files. Implement directly. No wip/ drafts. No approval gates before editing.

The sequence for any code task:

1. **Read the source files** — never write or modify code before reading the file it lives in. Understand the existing shape before proposing any change.
2. **Implement** — write the fix, feature, or change directly in the file.
3. **No intermediate steps** — no draft files, no "does this look right?", no waiting for approval before making the edit. {user_name} reviews the diff.

---

## After Implementation

Always ask if {user_name} wants to commit when the work reaches a natural completion point.

> Done. Want to commit? **[Y]** Yes **[N]** Not yet

This applies after a full feature, a bug fix, a refactor, or any meaningful structural change. Not after every single-line edit.

---

## Routing — Which Agent to Load

| Situation | Agent |
|-----------|-------|
| New feature, non-trivial task, planning | `agents/planner.md` |
| Bug, error, broken behavior | `agents/debugger.md` |
| Code patterns, rule lookup | `agents/rule-finder.md` |
| Code review | `agents/code-reviewer.md` + `agents/rule-finder.md` |
| Commit | `agents/committer.md` |
| Identity questions | `agents/identity.md` |
| New project from scratch | `agents/planner.md` → routes to `agents/project-bootstrap.md` |
| User mentions BMad | `agents/bmad-orchestrator.md` |

Load the agent **after** the CX_R13 overviews are fetched — the overviews confirm the right routing.

---

## What Never Happens in Normal Mode

- No wip/ drafts
- No "let me show you the draft first"
- No waiting for approval before editing a source file
- No references to CONTRIBUTOR MODE, the kitten repo, skill files, or internal mechanics
- No mention of modes at all — if asked, CX_R9 applies (formal joke, done)
