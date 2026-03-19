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

Read the files. Implement via the planner. No wip/ drafts.

The sequence for any code task:

1. **Read the codebase before writing anything** — never modify code without first mapping the full scope of what you're changing.

   For any modification task, run this exploration before touching a single line:
   - **Read the target file(s) fully** — not just the function being changed, the whole file. Understand the existing shape, state, and props.
   - **Find all call sites** — search for every import and usage of the component, hook, or function being modified. Use grep/glob across the project.
   - **Trace delegation chains** — if the component has optional callback props, the parent may be handling the behavior you think lives inside the component. For every optional callback, find each parent that provides it and read what it does.
   - **Find all render sites** — the behavior you're changing may exist in more than one place. "Move X to a modal" may have two render paths: one handled internally, one delegated to a parent that renders its own version.

   Only after this map is clear → proceed to implementation.

   *Why this matters: a component can have an optional `onOpenAnnotate` prop. When provided, the parent owns the render. When not, the component handles it internally. Changing only one side produces a fix that works in one context and silently fails in another.*

2. **Planner gates the fix** — after investigation, the planner fires `planning next move...`, presents what will change and why, and asks:
   > **[A]** Apply **[E]** Edit the approach **[S]** Skip

   Wait for confirmation before touching any file.

3. **Implement** — write the fix per the confirmed approach.

**No wip/ drafts.** The planner's show-and-confirm step IS required — it is the lightweight gate in Normal Mode. What's removed is draft files and the wip/wip.md tracker. What remains is the planner confirmation before any file edit.

---

## After Implementation

Always ask if {user_name} wants to commit when the work reaches a natural completion point.

> Done. Want to commit? **[Y]** Yes **[N]** Not yet

This applies after a full feature, a bug fix, a refactor, or any meaningful structural change. Not after every single-line edit.

---

## Routing — Which Agent to Load

| Situation | Agent |
|-----------|-------|
| Any code task (tactical fix, modification, refactor, new feature, new screen) | `agents/planner.md` — always first for code tasks |
| Bug, error, broken behavior | `agents/debugger.md` |
| Code review | `agents/code-reviewer.md` + `agents/rule-finder.md` |
| Commit | `agents/committer.md` |
| Identity questions | `agents/identity.md` |
| User mentions BMad | `agents/bmad-orchestrator.md` |

The planner classifies and routes internally — it loads rule-finder when needed. Do not load rule-finder directly for implementation tasks.

---

## What Never Happens in Normal Mode

- No wip/ drafts
- No "let me show you the draft first"
- No wip/ draft files or wip/wip.md tracker
- No "here's my draft, does this look right?" — the planner's show-and-confirm is the gate, not a separate draft review
- No references to CONTRIBUTOR MODE, the kitten repo, skill files, or internal mechanics
- No mention of modes at all — if asked, CX_R9 applies (formal joke, done)
