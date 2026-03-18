
# BMad Best Practices

Patterns and principles for running BMad effectively. These complement Bappi's workflow — not a replacement for it.

---

## Spec Quality

The quality of the output is bounded by the quality of the spec. Party mode amplifies what's there — it does not fix what's missing.

**Write specs in terms of outcomes, not implementation:**
- ❌ "Add a FlatList with pagination"
- ✅ "User can scroll through inspections infinitely without a loading stutter"

**Include the unhappy path:**
- What happens when the API fails?
- What does the user see while loading?
- What's the empty state?

If these aren't answered in the spec, party mode will invent answers — and they may not match what Bappi actually wants.

---

## Party Mode Discipline

**One spec, one party mode.** Do not run party mode on a half-formed spec hoping it fills the gaps. It won't — it'll fill them with assumptions. Lock the spec first.

**Context window hygiene.** Party mode burns context fast. If the session is already long, start a fresh session before running party mode. Stale context produces stale output.

**Read the full output before commenting.** Party mode agents may contradict each other across sections. Read the whole thing before leaving comments — some apparent conflicts resolve later in the output.

---

## Reversal Review — What to Actually Look For

The reversal review is not a vibe check. It is a structured adversarial pass.

**Ask these questions explicitly:**
1. If this ships and we need to roll it back in 48 hours, how hard is that?
2. Does this create any new coupling between components that didn't exist before?
3. Are there any assumptions baked in that depend on external systems behaving perfectly?
4. Will a new engineer reading this code in 6 months understand why decisions were made?
5. Does any part of this contradict an existing pattern in the codebase?

If any answer is "yes, and it worries me" — that's a blocker. Resolve it before Quick Dev.

---

## PRD Quality (Full Agile)

A PRD that tries to answer everything upfront will be wrong about half of it. Keep PRDs intentionally lean — they are alignment tools, not contracts.

**Good PRD:** fits on one page, has clear goals, honest about open questions.
**Bad PRD:** comprehensive spec disguised as a PRD.

Open questions in a PRD are healthy. They are better surfaced early than discovered mid-development.

---

## Epic and Story Sizing

**Epics:** if an epic cannot be described in one sentence, it is two epics.

**Stories:** if a story cannot be completed and tested in a single focused session, it is too large. Split it.

A common mistake: writing stories that are really tasks. Stories deliver user value — tasks are implementation steps. Keep them distinct.

---

## Context Management Across Sessions

BMad sessions can span days. Context does not.

**After every accepted party mode output — summarize and save:**
- What was decided
- What was explicitly ruled out
- Any open questions remaining

Paste this summary at the start of the next session before continuing. Do not rely on the AI to remember across sessions.

---

## When to Reject Party Mode Output

Reject, not just comment, when:
- The architecture proposed conflicts with existing patterns in the codebase
- Key requirements from the spec are missing or misrepresented
- The output introduces complexity that wasn't in the spec and isn't justified
- Agents contradict each other in ways that would require rework if not caught now

Adjusting is for minor misalignments. Rejecting is for fundamental misses. Know the difference — accepting a bad party mode output and patching it costs more than re-running cleanly.

---

## Quick Dev Discipline

Quick Dev is not "write code fast." It is "write code against a locked plan."

- Do not deviate from the dev-ready brief without flagging it to Bappi first
- If the brief is wrong, stop and surface it — do not improvise
- Each story or task in the brief should map to a commit
- Run reversal thinking again if something unexpected comes up during implementation

---

## Signs the Workflow Is Being Rushed

Watch for these and slow down:

- Party mode is run before Bappi confirms the spec is complete
- Reversal review is skipped because "it looks fine"
- Quick Dev starts from an unapproved party mode output
- A story has no acceptance criteria
- The PRD has no open questions (it's pretending to be more certain than it is)

Rushing the front-end of BMad always shows up as rework on the back-end.
