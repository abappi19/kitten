# Self-Eval Agent

## Purpose

Runs Kitten Bot's own eval suite to validate that rules, tone, and boundary responses are working correctly. Use this in Contributor Mode when making changes to skill files.

**Trigger phrases:** "eval yourself", "run evals", "test yourself", "validate the skill", "run self-eval"

---

## When to Run

- After any change to `rules/`, `agents/`, or `references/kitten/`
- Before committing a batch of changes
- When Bappi asks to validate behavior

---

## Infrastructure

Evals live in `evals/evals.json` at the repo root (internal use only — not shipped with the skill).
Results go to `test-workspace/kitten-bot-workspace/iteration-<N>/`.
Grading uses skill-creator's grader: `.claude/skills/skill-creator/agents/grader.md`.
Aggregation uses: `.claude/skills/skill-creator/scripts/aggregate_benchmark.py`.
Viewer uses: `.claude/skills/skill-creator/eval-viewer/generate_review.py`.

---

## Process

### Step 1 — Determine iteration number
Check `test-workspace/kitten-bot-workspace/` for existing iteration directories. Use the next number.

### Step 2 — Spawn all test runs in parallel

For each eval in `evals/evals.json`, spawn one subagent:

```
Execute this task:
- Skill path: /path/to/.claude/skills/kitten-bot
- Working directory: test-workspace (for Normal Mode detection)
- Task: <eval prompt>
- Boot the skill fully: load all local files, run config init, detect mode via git remote from working directory
- Save response to: test-workspace/kitten-bot-workspace/iteration-<N>/<eval_name>/with_skill/outputs/response.md
- Save notes.md (mode detected, fetch calls made) in the same directory
```

All runs in a single turn — never sequential.

### Step 3 — While runs are in progress, draft assertions

Review `evals/evals.json` expectations. Confirm they are discriminating — they should fail when the skill breaks, not just when the output is wrong.

### Step 4 — Grade each run

Spawn grader subagents (or grade inline) using `.claude/skills/skill-creator/agents/grader.md`.

Pass:
- `expectations` from the eval
- `transcript_path`: the agent's output file
- `outputs_dir`: the `with_skill/outputs/` directory

Save `grading.json` as sibling to `outputs/`.

### Step 5 — Aggregate and view

```bash
python -m scripts.aggregate_benchmark test-workspace/kitten-bot-workspace/iteration-<N> --skill-name kitten-bot
```

Then launch viewer:
```bash
nohup python .claude/skills/skill-creator/eval-viewer/generate_review.py \
  test-workspace/kitten-bot-workspace/iteration-<N> \
  --skill-name "kitten-bot" \
  --benchmark test-workspace/kitten-bot-workspace/iteration-<N>/benchmark.json \
  > /dev/null 2>&1 &
```

### Step 6 — Report

Surface any failing evals to Bappi with:
- Which rule is failing
- The actual response vs expected
- Suggested fix (draft in `wip/` first)

---

## Pass Criteria

All 8 evals should pass. Any failure means a rule is broken or ambiguous. Fix in `wip/` → get approval → apply to source.
