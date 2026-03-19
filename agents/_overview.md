# Agents — Overview

All agents available in the Kitten skill. Fetch this file first to identify which agent to load for a given task. Never load an agent speculatively — fetch only what the task requires.

---

## Available Agents

| Agent | Purpose | When to load |
|-------|---------|-------------|
| `agents/session-boot.md` | Session startup — load order, config init, language rules | Every session start (local, loaded automatically) |
| `agents/identity.md` | Handles questions about who Kitten Bot or Bappi is | User asks "who are you?", "who is Bappi?", "what can you help with?" |
| `agents/code-reviewer.md` | Bappi-style code review with rule library integration | User shares code for review or audit |
| `agents/rule-finder.md` | Routes to the correct rule library via overviews | Writing or reviewing any code — reads rule overviews first, fetches specific files only. Loaded by the planner — not directly for implementation tasks. |
| `agents/committer.md` | Git commits with Kitten co-author trailer | User wants to commit, save progress, or finalize changes |
| `agents/project-bootstrap.md` | Full project setup from scratch — 17-step decision sequence, scaffold, and verify | User says "new app", "start a new project", "from scratch", "build a new X app" with no existing codebase |
| `agents/planner.md` | Plans the next move for every code task — classifies (tactical / feature / new project / debug / observation), maps the existing codebase, defines exploration steps before any code is written | **Any task involving code changes** — tactical fix, modification, refactor, new feature, new screen. Always load this first for code tasks. |
| `agents/debugger.md` | Systematic debugging — understand → locate → trace → isolate → fix | User pastes an error, stack trace, or describes broken behavior |
| `agents/self-eval.md` | Runs Kitten's eval suite — validates rules, tone, and boundary responses | "eval yourself", "run evals", "test yourself", "validate the skill" — **Contributor Mode only** |
| `agents/description-optimizer.md` | Optimizes SKILL.md description for better triggering accuracy | "optimize description", "improve trigger accuracy", "run description eval" — **Contributor Mode only** |
| `agents/grader.md` | Evaluates expectations against execution transcripts and outputs, produces grading.json | Spawn as subagent during self-eval grading step — **Contributor Mode only** |
| `agents/comparator.md` | Blind A/B comparison between two outputs without knowing which skill produced which | Used during Improve mode to compare skill versions — **Contributor Mode only** |
| `agents/analyzer.md` | Post-hoc analysis of why a winner won + benchmark pattern analysis | Used after comparator to extract improvement suggestions — **Contributor Mode only** |
| `agents/bmad-orchestrator.md` | Guides through the full BMad workflow — reads installed BMad, runs bmad-help, hands off | User mentions BMad, party mode, quick spec, quick dev, or Step 17 of project-bootstrap |

---

## Routing Notes

- **Any code task (tactical or non-trivial):** fetch `agents/planner.md` first — it classifies the task, maps the existing codebase, and defines the next move. It loads rule-finder internally when needed.
- **New project from scratch:** `agents/planner.md` detects new-project signals and routes to `agents/project-bootstrap.md` automatically.
- **Code review:** fetch both `agents/code-reviewer.md` and `agents/rule-finder.md` — always validate against rule libraries.
- **Debug then fix:** after `agents/debugger.md` identifies the root cause, route to `agents/planner.md` to plan the fix — it will load rule-finder as needed.
- **`agents/rule-finder.md` is the gateway to all rule libraries.** It is loaded by the planner — not directly for implementation tasks.
- **Contributor Mode only:** `agents/self-eval.md`, `agents/description-optimizer.md`, `agents/grader.md`, `agents/comparator.md`, and `agents/analyzer.md` are internal tools — never invoke in Normal Mode.

---

As new agents are added, they will appear in this file with their path, purpose, and loading guidance.
