# Agents — Overview

All agents available in the Kitten skill. Fetch this file first to identify which agent to load for a given task. Never load an agent speculatively — fetch only what the task requires.

---

## Available Agents

| Agent | Purpose | When to load |
|-------|---------|-------------|
| `agents/session-boot.md` | Session startup — load order, config init, language rules | Every session start (local, loaded automatically) |
| `agents/identity.md` | Handles questions about who Kitten Bot or Bappi is | User asks "who are you?", "who is Bappi?", "what can you help with?" |
| `agents/code-reviewer.md` | Bappi-style code review with rule library integration | User shares code for review or audit |
| `agents/rule-finder.md` | Routes to the correct rule library via overviews | Writing or reviewing any code — reads rule overviews first, fetches specific files only |
| `agents/committer.md` | Git commits with Kitten co-author trailer | User wants to commit, save progress, or finalize changes |
| `agents/planner.md` | Feature and task planning — assesses scope, decides whether to offer BMad or write a lightweight `.md` plan, then hands off to rule-finder for implementation | User wants to plan/implement a non-trivial feature or task — planner owns the BMad decision |
| `agents/debugger.md` | Systematic debugging — understand → locate → trace → isolate → fix | User pastes an error, stack trace, or describes broken behavior |
| `agents/self-eval.md` | Runs Kitten's eval suite — validates rules, tone, and boundary responses | "eval yourself", "run evals", "test yourself", "validate the skill" — **Contributor Mode only** |
| `agents/description-optimizer.md` | Optimizes SKILL.md description for better triggering accuracy | "optimize description", "improve trigger accuracy", "run description eval" — **Contributor Mode only** |
| `agents/bmad-orchestrator.md` | Guides through the full BMad workflow — spec, party mode, reversal review, dev | User mentions BMad, party mode, quick spec, quick dev, or wants to plan/start a feature |

---

## Routing Notes

- **Code + planning together (non-BMad path):** fetch `agents/planner.md` first — it assesses scope, optionally offers BMad, writes the plan, gets approval — then fetch `agents/rule-finder.md` to begin implementation.
- **Code review:** fetch both `agents/code-reviewer.md` and `agents/rule-finder.md` — always validate against rule libraries.
- **Debug then fix:** after `agents/debugger.md` identifies the root cause, route to `agents/rule-finder.md` if the fix involves a code pattern decision.
- **`agents/rule-finder.md` is the gateway to all rule libraries.** Never skip it when writing or reviewing code.
- **Contributor Mode only:** `agents/self-eval.md` and `agents/description-optimizer.md` are internal tools — never invoke in Normal Mode.

---

As new agents are added, they will appear in this file with their path, purpose, and loading guidance.
