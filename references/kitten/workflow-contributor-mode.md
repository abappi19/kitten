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

## Sync with World

A structured workflow for keeping Bappi's knowledge base current by learning from how other engineers build skills and agents.

**Triggered when Bappi says:**
- "sync with world"
- "update [topic] from the community"
- "search skills.sh for [topic]"
- "see how others do [topic]"
- Any request in Contributor Mode to update knowledge by looking at what others are building

**The search endpoint:**
```
https://skills.sh/?q={search_query}
```

Replace `{search_query}` with a focused term derived from what Bappi asked to update. Examples: `react-native`, `architecture`, `testing`, `auth`, `api-design`, `typescript`.

---

### Step 1 — Search

Fetch `https://skills.sh/?q={search_query}`. Parse the results. Identify 3–5 skills or agents most relevant to:
- The topic Bappi asked about
- Bappi's actual stack (TypeScript, React Native, Hono.js, Expo, Zustand, TanStack Query)
- Areas where Bappi's current references may be thin or outdated

Present a short list to Bappi:

```
Found these on skills.sh:

1. [Skill name] — [one-line description] — [URL]
2. [Skill name] — [one-line description] — [URL]
3. [Skill name] — [one-line description] — [URL]

Which ones do you want me to review?
[A] All  [1,2…] Pick  [S] Skip
```

Halt. Wait for Bappi's selection before fetching anything.

---

### Step 2 — Review Selected Skills

For each selected skill, fetch its content. Read it fully. Extract:

- **Patterns and techniques** Bappi doesn't currently have documented
- **Approaches that conflict** with Bappi's existing patterns — note separately
- **Anything irrelevant** to Bappi's stack — discard silently (Python, Ruby, Go, framework-specific to others)

---

### Step 3 — Propose Updates Collaboratively

Surface findings to Bappi one at a time:

```
From [skill name]:

Finding: [what they do]
Gap in Bappi's refs: [what's currently missing or weaker]
Proposed update: [which file to update, what to add/change]
Adaptation: [how it needs rewriting for TypeScript / Bappi's stack]

[A] Add to refs  [S] Skip  [M] Modify before adding
```

**Rules:**
- One finding at a time — never dump multiple proposals in one message
- Always frame in Bappi's voice — "Bappi's approach" not generic best practice
- Always adapt to TypeScript and Bappi's stack — never copy Python/Ruby/Go verbatim
- Never touch identity, philosophy, or communication style refs — those are frozen
- If a finding conflicts with an existing rule → flag the conflict explicitly, then let Bappi decide

Halt after each finding. Wait for the answer before surfacing the next one.

---

### Step 4 — Apply via wip/ Cycle

For each finding Bappi approves:
1. Draft the change in `wip/` following the normal wip/ cycle
2. Show the draft
3. Apply after approval
4. Clean up

All standard wip/ rules apply — no direct source edits, no silent changes.

---

### What Stays Fixed

No matter what skills.sh shows, these never change via Sync with World:

| Fixed | Why |
|-------|-----|
| `references/bappi/profile.md` | Bappi's identity — not a community opinion |
| `references/bappi/writing-style.md` | His voice — not derivable from other skills |
| `references/kitten/communication-style.md` | Kitten's behavior — set by Bappi, not consensus |
| `rules/CRITICAL.md` | Non-negotiable rules — never updated via sync |
| Core stack decisions (Zustand, MMKV, TanStack Query) | Already decided — conflicts are flagged, not silently overridden |

---

## What Never Happens in Contributor Mode

- No direct edits to source files without a wip/ draft first
- No applying a draft without explicit approval
- No leaving a wip/ draft alive after it has been applied
- No stale entries in wip/wip.md
- No boundary jokes in response to skill improvement requests
- No deflection of any request — Bappi owns this skill, every request is valid
