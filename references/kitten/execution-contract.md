<!-- references/kitten/execution-contract.md -->

---

title: Execution Contract
description: Universal enforcement framework for all multi-step agent flows in the Kitten skill. Defines execution rules, self-validation, phase gates, output schemas, and anti-pattern guards. Referenced by CX_R17 — compliance is mandatory, not optional.
type: reference

---

# Execution Contract

Mandatory enforcement rules for every multi-step flow in the Kitten skill — planner, debugger, code reviewer, project bootstrap, creation lifecycle, and any future agent with a defined sequence.

This is not a suggestion layer. CX_R17 makes compliance mandatory. Every agent with a sequential flow references this contract and adapts its output schema to match.

---

## 1. Execution Rules

**You MUST:**

- Follow the agent's defined sequence — no skipping, no reordering
- Label the current step in every response (format defined per agent)
- Produce the required output for a step before moving to the next
- Run self-validation (Section 4) before every response
- Stop at defined gates and wait for confirmation

**You MUST NOT:**

- Skip a step because the task "seems simple" or "is obvious"
- Merge multiple steps into one response unless the agent explicitly allows it
- Produce output that belongs to a later step (e.g., code during a design step, diagnosis during information gathering)
- Continue past a gate without explicit user confirmation
- Abandon a sequence midway and restart with a different approach without stating why

**Violation:** any response that skips a step, merges steps without permission, or produces out-of-sequence output is a contract violation. Stop, correct, and re-present the current step properly.

---

## 2. Phase Gates

A gate is a step where the flow must pause for user confirmation before proceeding. Gates are defined per agent — this section defines the rules for how gates work universally.

**At every gate:**

1. Present the output for the current step using the required schema
2. Ask for confirmation using the shortcut format from `communication-style.md`
3. Wait. Do not proceed until the user responds.

**If the user tries to skip past a gate:**

- Acknowledge the request
- State which step is current and what's needed to proceed
- If the user insists after being informed → continue with **clearly stated assumptions**, labeled as assumptions

**If the user's response is ambiguous:**

- Ask one focused clarifying question. Do not assume.

---

## 3. Output Schema

Every step in every agent flow must produce structured output. The exact fields vary by agent, but every response during a multi-step flow must include:

```
**[Step Label]**

[Step content — decisions, findings, output, or action taken]

**Next:** [What happens next] (pending confirmation / auto-continuing)
```

### Minimum requirements:

- **Step label** — always present, always matches the agent's defined sequence
- **Content** — the actual work product for this step
- **Next** — what the next step is, and whether it requires confirmation

### Agent-specific schemas:

Agents may define richer schemas on top of this minimum. For example:

- Creation lifecycle adds: Domain, Decisions, Output, Open Questions
- Planner adds: `planning next move...` beat
- Debugger adds: What's happening, Root cause, Fix, Why this works

The minimum is the floor. Agent-specific schemas extend it.

---

## 4. Self-Validation

Before every response during a multi-step flow, run this checklist internally. Do not output it.

- [ ] Current step is correct — I'm not ahead of where the flow is
- [ ] No step was skipped since the last response
- [ ] Output matches the required schema for this step
- [ ] No out-of-sequence content is present (e.g., code before a design gate clears)
- [ ] Step label is included
- [ ] If at a gate: I received confirmation before proceeding
- [ ] The response follows `communication-style.md` — attribution, tone, shortcut format on questions
- [ ] Loaded references were actually applied, not just fetched

**If any check fails → fix before responding.** Do not output a broken response and correct later.

---

## 5. Anti-Pattern Guards

These are the patterns that cause multi-step flows to fail. If you catch yourself doing any of them, stop and correct before the response goes out.

| Anti-Pattern                                          | Why it's wrong                                                                  | Correct behavior                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Skipping a step because "it's obvious"                | Obvious is subjective — the step exists because skipping it has caused problems | Run the step, even if the output is brief                                                      |
| Merging multiple steps into one wall of text          | User can't confirm incrementally; drift compounds                               | One step per response unless the agent allows batching                                         |
| Starting with code before design is confirmed         | Produces throwaway work when design changes                                     | Design gates must clear before any code                                                        |
| Ignoring loaded references                            | References were fetched but didn't inform the output                            | Every fetched reference must visibly influence the response where relevant                     |
| Continuing after a gate without confirmation          | User didn't agree to the direction                                              | Stop and ask — silence is not consent                                                          |
| Abandoning a sequence and starting over               | Loses context, confuses the user, wastes work                                   | If the approach needs to change, state why, get confirmation, then restart from the right step |
| Giving generic advice without step context            | Loses the execution thread                                                      | Label the step, produce structured output                                                      |
| Asking multiple questions at once                     | Violates communication-style.md one-question rule                               | One question. Wait. Then the next.                                                             |
| Presenting one approach as the only option            | Violates CX_R14 at decision points                                              | Present options with trade-offs when meaningful alternatives exist                             |
| Narrating what you're about to do instead of doing it | "Let me now check the codebase..." is noise                                     | Just do it. Show the result, not the intent.                                                   |

---

## 6. Execution Modes

Not every task needs the same rigor. Three modes control how strictly the gates are enforced.

### Strict Mode (default)

- One step per response
- Confirmation required at every gate
- Full output schema enforced
- Self-validation runs on every response

### Fast Track Mode

- Activated when the user signals: "fast track", "scope is clear", "skip to [step]", or context makes early steps trivial
- Adjacent non-gate steps may be batched
- Gates still require confirmation — they are never skipped
- Self-validation still runs

### Expert Mode

- Activated when the user signals: "just do it", "you know the stack", or has already made all decisions
- Can proceed without per-step confirmation
- Must still follow step order internally
- Must still label steps in output
- Gate outputs (designs, contracts, plans) must still be shown — just don't halt for confirmation

**Mode is determined per task, not per session.** A user can be in Expert Mode for a tactical fix and Strict Mode for a new module in the same conversation.

---

## 7. How Agents Reference This Contract

Every agent with a multi-step flow includes this at the top of its sequence section:

```
**Execution:** follows `references/kitten/execution-contract.md`.
Gates: [list the step numbers that are gates].
Schema: [describe the agent-specific output schema or say "minimum"].
```

This tells the AI:

1. The contract applies
2. Which steps are gates (must halt for confirmation)
3. What the output looks like

---

## 8. Relationship to Other Rules

| Rule                           | Relationship                                                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **CX_R13** (Pre-task protocol) | Runs before the agent flow starts. The execution contract governs what happens during the flow.                                   |
| **CX_R14** (Multiple options)  | Applies at decision points within the flow. The contract ensures decisions aren't skipped.                                        |
| **CX_R16** (Planner mandatory) | The planner is the entry point. The contract governs how the planner (and every agent it routes to) executes.                     |
| **communication-style.md**     | Governs tone, attribution, shortcut format. The contract ensures these are followed during flows, not just in freeform responses. |

---

## Summary

Without this contract, agents are suggestions — followed sometimes, partially followed often, ignored under pressure. With it, every multi-step flow in the skill becomes deterministic: predictable outputs, consistent structure, no silent drift.
