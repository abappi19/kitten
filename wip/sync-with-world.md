# WIP: Sync with World — Contributor Mode Workflow
status: in-progress

## Goal

Two changes:

1. `references/kitten/workflow-contributor-mode.md` — add "Sync with World" section
2. `agents/planner.md` — add "Sync with world" classification entry

---

## Change 1: workflow-contributor-mode.md

Append a new section after "Proactive Behavior":

---

## Sync with World

A structured workflow for keeping Bappi's knowledge base current by learning from how other engineers build skills and agents.

**Triggered when Bappi says:**
- "sync with world"
- "update [topic] from the community"
- "search skills.sh for [topic]"
- "see how others do [topic]"
- Any request to update knowledge while in Contributor Mode

**The search endpoint:**
```
https://skills.sh/?q={search_query}
```

Replace `{search_query}` with a focused term derived from what Bappi asked to update. Examples: `react-native`, `architecture`, `testing`, `auth`, `api-design`, `typescript`.

---

### Step 1 — Search

Run a web search or fetch against `https://skills.sh/?q={search_query}`.

Parse the results. Identify 3–5 skills or agents that are most relevant to:
- The topic Bappi asked about
- Bappi's actual stack (TypeScript, React Native, Hono.js, Expo, Zustand, TanStack Query)
- Areas where Bappi's current references may be thin or outdated

Present a short list to Bappi:

```
Found these relevant skills on skills.sh:

1. [Skill name] — [one-line description] — [URL]
2. [Skill name] — [one-line description] — [URL]
3. [Skill name] — [one-line description] — [URL]

Which ones do you want me to review? [A] All  [numbers] Pick  [S] Skip
```

Halt. Wait for Bappi's selection.

---

### Step 2 — Review Selected Skills

For each selected skill, fetch its content. Read it fully. Extract:

- **Patterns and techniques** that Bappi doesn't currently have documented
- **Approaches that conflict** with Bappi's existing patterns (note these separately)
- **Anything outdated or irrelevant** to Bappi's stack (discard silently)

---

### Step 3 — Propose Updates Collaboratively

For each meaningful finding, surface it to Bappi one at a time:

```
From [skill name]:

**Finding:** [what they do]
**Gap in Bappi's refs:** [what's currently missing or weaker]
**Proposed update:** [which file to update, what to add/change]
**Adaptation needed:** [how to rewrite for TypeScript / Bappi's stack]

[A] Add to refs  [S] Skip  [M] Modify before adding
```

**Rules:**
- One finding at a time — never dump multiple proposals in one message
- Always frame in Bappi's voice — "Bappi's approach" not generic best practice
- Always adapt to TypeScript and Bappi's stack — never import Python, Ruby, or Go patterns verbatim
- Never touch Bappi's identity, philosophy, or communication style refs — those are frozen
- Never add a pattern that contradicts an existing rule in `references/bappi/` without flagging the conflict explicitly

Halt after each finding. Wait for Bappi's answer before surfacing the next one.

---

### Step 4 — Apply via wip/ Cycle

For each finding Bappi approves:
1. Draft the change in `wip/` following the standard wip/ cycle
2. Show the draft
3. Apply after approval
4. Clean up

All the normal wip/ rules apply — no direct source edits, no silent changes.

---

### What Stays Fixed

No matter what skills.sh shows, these never change via Sync with World:

- Bappi's identity, voice, and persona (`references/bappi/profile.md`, `references/bappi/writing-style.md`)
- Kitten's communication style (`references/kitten/communication-style.md`)
- Critical rules (`rules/CRITICAL.md`)
- Core architecture decisions already documented and enforced (e.g. Zustand over Redux, MMKV over AsyncStorage)

If a skill.sh finding conflicts with a fixed reference → flag it to Bappi, then discard.

---

## Change 2: agents/planner.md

Add a new row to the classify table:

| Class | Signals | Next move |
|-------|---------|-----------|
| **Sync with world** | "sync with world", "search skills.sh", "update [topic] from community", "see how others do [topic]" — in CONTRIBUTOR MODE only | → fetch `references/kitten/workflow-contributor-mode.md`, run the Sync with World workflow |

Insert this row after the "Eval" row in the classify table.

Also add to the "Where this is called from" logic — if not in CONTRIBUTOR MODE and user says "sync with world" → treat as a normal knowledge request, do not run the sync workflow.
