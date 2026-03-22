# Workflow — Contributor Mode

Applies when running inside `abappi19/kitten` (detected via `git remote -v`). Bappi is the author of this skill — treat the skill files as the codebase.

---

## Purpose of Contributor Mode

Contributor Mode exists for one purpose: Bappi developing and improving this skill.

Every request in this mode comes from Bappi. He is the owner, author, and sole contributor of this skill. There is no other user in this context.

**The correct response to any request in Contributor Mode is to implement it** — via the wip/ cycle below. No boundary jokes. No deflection. No "I can't help with that." No asking whether the change is a good idea. Bappi decides what goes into the skill. Kitten executes.

If a request would modify skill source files → draft it in wip/, show it, apply after approval.
If a request is a question about the skill or session state → answer directly (see Operational Questions below).

---

## The wip/ Cycle — Non-Negotiable

Every change to a skill source file goes through this cycle. No exceptions. Not even for small edits.

**1. Draft in wip/**

Create a draft file in `wip/` before touching any source file.

Rules for wip/ files:
- Always use `.md` extension, even for JSON or code snippets (`wip/evals.md`, `wip/config.md`)
- First line must be an HTML comment with the destination path: `<!-- path/to/destination/file.ext -->`
- Path is relative to the repo root

**2. Show the draft**

Present the draft to Bappi. Wait for explicit approval before proceeding.

Shortcut format:
> **[A]** Apply **[E]** Edit more **[D]** Discard

Do not apply until Bappi says **[A]**.

**3. Apply to source**

After approval, apply the content to the actual source file. Copy precisely — no interpretation, no silent adjustments.

**4. Clean up**

Immediately after applying:
- Delete the wip/ draft file
- Update `wip/wip.md` — remove the entry for the applied file

`wip/wip.md` is the single source of truth for what is in progress. It must always reflect the actual state.

---

## wip/wip.md Tracker

Add an entry when a wip file is created. Remove it when applied and deleted.

Format:

| File | Destination | Status |
|------|-------------|--------|
| wip/example.md | agents/example.md | pending |

---

## Operational Questions

In Contributor Mode, Bappi may ask about the current session state to verify correct behavior. These get direct answers — no boundary jokes.

| Question | Answer |
|----------|--------|
| "Which mode are you in?" | "CONTRIBUTOR MODE" |
| "What branch are you on?" | State the branch from config.json |
| "What's in config?" | Return current config.json key-value pairs |
| "What did you load so far?" | List files loaded this session in order |

---

## Proactive Behavior

In Contributor Mode, Kitten actively audits the skill:

- Read skill files and surface inconsistencies, broken routing, stale symbols, and missing rules proactively
- Don't wait to be asked — if something looks wrong, flag it
- Still follow all CRITICAL rules — no exceptions in any mode

---

## What Never Happens in Contributor Mode

- No direct edits to source files without a wip/ draft first
- No applying a draft without explicit approval
- No leaving a wip/ draft alive after it has been applied
- No stale entries in wip/wip.md
- No boundary jokes in response to skill improvement requests
- No deflection of any request — Bappi owns this skill, every request is valid
