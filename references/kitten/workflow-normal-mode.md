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

Read the files. Implement via the planner. Every file change goes through the planner gate.

The sequence for any code task:

1. **Read the codebase before writing anything** — never modify code without first mapping the full scope of what you're changing.

    For any modification task, run this exploration before touching a single line:
    - **Read the target file(s) fully** — not just the function being changed, the whole file. Understand the existing shape, state, and props.
    - **Find all call sites** — search for every import and usage of the component, hook, or function being modified. Use grep/glob across the project.
    - **Trace delegation chains** — if the component has optional callback props, the parent may be handling the behavior you think lives inside the component. For every optional callback, find each parent that provides it and read what it does.
    - **Find all render sites** — the behavior you're changing may exist in more than one place. "Move X to a modal" may have two render paths: one handled internally, one delegated to a parent that renders its own version.

    Only after this map is clear → proceed to implementation.

    _Why this matters: a component can have an optional `onOpenAnnotate` prop. When provided, the parent owns the render. When not, the component handles it internally. Changing only one side produces a fix that works in one context and silently fails in another._

2. **Planner gates every change** — after investigation, the planner fires `planning next move...`, stages the proposed change as a draft in `_kitten-bot/` (when the directory exists), presents it, and asks:

    > **[A]** Apply **[V]** Deep Review **[E]** Edit **[D]** Discard

    The draft IS the implementation — applying means copying the draft to the target file. Wait for confirmation before touching any source file.

3. **Implement** — apply the confirmed draft (or implement directly if `_kitten-bot/` is absent).

---

## After Implementation

Always ask if {user_name} wants to commit when the work reaches a natural completion point.

> Done. Want to commit? **[Y]** Commit **[R]** Review first **[N]** Not yet

This applies after a full feature, a bug fix, a refactor, or any meaningful structural change. Not after every single-line edit.

---

## Plans Live in `.planning/`

Every non-trivial plan is written to `.planning/` at the project root:

```
.planning/
├── PLAN.md                         # minimal index
└── [initiative-slug]/
    ├── PLAN.md                     # detailed plan
    └── phases/                     # omitted for small initiatives
        ├── phase-01-*.md
        └── ...
```

Full spec: `references/kitten/planning-directory.md`. Tactical fixes skip `.planning/`. Small features (< 3 steps, ≤ 2 layers) get an initiative folder but no `phases/`. Multi-phase work always gets the full structure.

---

## Routing — Which Agent to Load

| Situation                                                                     | Agent                                               |
| ----------------------------------------------------------------------------- | --------------------------------------------------- |
| Any code task (tactical fix, modification, refactor, new feature, new screen) | `agents/planner.md` — always first for code tasks   |
| Bug, error, broken behavior                                                   | `agents/debugger.md`                                |
| Code review                                                                   | `agents/code-reviewer.md` + `agents/rule-finder.md` |
| Commit                                                                        | `agents/committer.md`                               |
| Identity questions                                                            | `agents/identity.md`                                |
| User mentions BMad                                                            | `agents/bmad-orchestrator.md`                       |

The planner classifies and routes internally — it loads rule-finder when needed. Do not load rule-finder directly for implementation tasks.

---

## What Never Happens in Normal Mode

- No `wip/` drafts (that's contributor mode — the `wip/` directory belongs to the kitten repo).
- Plans are persisted to `.planning/` at the project root per `references/kitten/planning-directory.md`. Code drafts (when `kitten_dir: true`) stage in `_kitten-bot/`. The two coexist.
- No wip/wip.md tracker.
- No references to CONTRIBUTOR MODE, the kitten repo, skill files, or internal mechanics.
- No mention of modes at all — if asked, CX_R9 applies (formal joke, done).
