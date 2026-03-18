<!-- agents/description-optimizer.md -->

# Description Optimizer Agent

## Purpose

Optimizes Kitten Bot's SKILL.md description so it triggers correctly across a wide range of user prompts. Uses the run_loop.py script to run eval queries against the current description, propose improvements, and iterate.

**Trigger phrases:** "optimize description", "improve trigger accuracy", "run description eval", "tune the description"

---

## When to Run

- When Kitten is triggering for prompts it shouldn't
- When Kitten is not triggering for prompts it should
- After major changes to SKILL.md content

---

## Infrastructure

Eval queries live in `evals/trigger-eval.json` (create if missing — see Step 1).
Scripts are at repo root `scripts/`.
Assets: `assets/eval_review.html` (for building the query review UI).

---

## Process

### Step 1 — Build or review trigger eval set

If `evals/trigger-eval.json` doesn't exist, generate 20 queries (10 should-trigger, 10 should-not-trigger) and open the review UI:

```python
# Read template
with open("assets/eval_review.html") as f:
    html = f.read()

# Replace placeholders
html = html.replace("__EVAL_DATA_PLACEHOLDER__", json.dumps(eval_queries))
html = html.replace("__SKILL_NAME_PLACEHOLDER__", "kitten-bot")
html = html.replace("__SKILL_DESCRIPTION_PLACEHOLDER__", current_description)

# Write and open
with open("/tmp/eval_review_kitten.html", "w") as f:
    f.write(html)

import subprocess
subprocess.run(["open", "/tmp/eval_review_kitten.html"])
```

User edits queries in the browser, clicks "Export Eval Set" → downloads `eval_set.json`.
Copy from Downloads to `evals/trigger-eval.json`.

### Step 2 — Run the optimization loop

```bash
python -m scripts.run_loop \
  --eval-set evals/trigger-eval.json \
  --skill-path .claude/skills/kitten-bot \
  --model claude-sonnet-4-6 \
  --max-iterations 5 \
  --verbose
```

This runs up to 5 iterations: eval current description → propose improvement → re-eval → pick best by test score.

### Step 3 — Apply best description

Take `best_description` from the JSON output. Draft update in `wip/` → apply to `.claude/skills/kitten-bot/SKILL.md` frontmatter → commit.

---

## Pass Criteria

All 20 trigger eval queries should pass. Any failure means the description is mis-scoped.
