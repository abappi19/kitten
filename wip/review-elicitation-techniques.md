# WIP: Deep Review Elicitation in Kitten Planner
status: in-progress

## Goal

Add 6 deep-review elicitation techniques to kitten's planner (`agents/planner.md`).
After a plan is presented and before implementation begins, the review gate shows a
Deep Review panel. Complex features auto-run the most relevant techniques. Simple
features show the menu and wait.

BMad files are reference-only — this lives entirely in kitten's remote agents.

---

## File to Change

`agents/planner.md` — remote file in `abappi19/kitten`

---

## Where It Hooks In

The planner already has two review gates:

**Tactical Plan — Step 5** ("Show and confirm"):
```
> **[A]** Apply **[E]** Edit the approach **[S]** Skip
```

**Feature Plan — Definition of Done gate (Step 6)**:
```
> **[C]** Commit **[R]** Revise **[S]** Skip commit for now
```

The `[R] Revise` in the DoD gate and `[E]` in the Tactical confirmation are the
natural hooks. But a dedicated `[V] Deep Review` option before implementation
is cleaner and more intentional.

**Decision:** Add `[V] Deep Review` to:
1. Tactical Plan Step 5 confirm menu — before the user says Apply
2. Feature Plan "After Plan Approval" — before implementation starts

---

## The Deep Review Panel (inline in planner.md)

Insert as a named section after the Feature Plan rules, before Observation Intake.
Tactical and Feature flows both reference it by name.

```markdown
## Deep Review

Runs before implementation. Surfaces risk, gaps, and edge cases while changes
are still cheap.

---

### Complexity Assessment

Score the plan against these signals:

| Signal | Weight |
|--------|--------|
| Implementation steps > 5 | High |
| Touches 3+ distinct layers (state + API + UI + navigation + auth) | High |
| Concurrent operations present (offline, optimistic updates, real-time, queue) | High |
| Multiple screens or multiple status flows | Medium |
| External API or type dependencies > 3 | Medium |
| Single file, clear scope, no state involved | → Skip to menu only |

**HIGH** = 1+ High signal or 2+ Medium signals → auto-run
**LOW** = none of the above → show menu, wait

---

### Techniques

1. **Pre-Mortem** — It's 2 weeks from now and this shipped broken. What went wrong?
   Walk the most likely failure scenarios. Work backwards to find what to prevent now.

2. **Edge Case Sweep** — Systematically walk every boundary condition and state
   transition: empty states, null inputs, concurrent actions, permission edges,
   network failures, offline mode, every branch in the logic.

3. **Dependency Audit** — Trace every external dependency in the plan (backend
   endpoints, query response shapes, exported types, third-party services). Verify
   each assumption explicitly — does that API actually return that shape?

4. **User Journey Walkthrough** — Step through the user's exact tap-by-tap flow
   for each status and scenario, from first entry to every exit state.

5. **Conflict Matrix** — Map interactions between all concurrent features in the
   plan (offline queue, optimistic updates, auto-complete, publish, real-time sync).
   Find race conditions and state conflicts.

6. **Full Deep Review** — Run all five sequentially. Recommended for any feature
   touching state + API + navigation or with concurrent operations.

---

### Display Format

```
**Deep Review**
Before implementing — takes 2 minutes, saves hours.

1. Pre-Mortem — "It shipped broken. What went wrong?"
2. Edge Case Sweep — Every boundary and state transition
3. Dependency Audit — Every external dependency, verified
4. User Journey Walkthrough — Tap-by-tap through the real flow
5. Conflict Matrix — Race conditions between concurrent features
6. Full Deep Review — All five sequentially

[x] Skip — implement now

Choose 1–6 or [x]:
```

---

### Execution

**LOW complexity:** Show menu above. HALT. Wait for user selection.

**HIGH complexity:** Do not halt. Announce and auto-run:

- Concurrent operations detected → run **1, 5, 2** (Pre-Mortem, Conflict Matrix, Edge Case Sweep)
- Heavy external dependencies → run **3, 1, 2** (Dependency Audit, Pre-Mortem, Edge Case Sweep)
- Multi-screen / multi-status flow → run **4, 1, 2** (User Journey, Pre-Mortem, Edge Case Sweep)
- Default complex → run **1, 2, 4** (Pre-Mortem, Edge Case Sweep, User Journey)

Announce before running:
> *"This plan is complex — running the most relevant deep-review techniques automatically: [names]. You can stop anytime."*

After each technique: present findings. Ask: "Apply findings to the plan? [Y] Yes [N] No"
After all complete: return to the plan confirmation prompt.

For option **6**: run all five in sequence.
For user-selected single number: run that one, ask to apply, return to menu.
```

---

## Hook Points in planner.md

### Tactical Plan — Step 5 confirm menu

Add `[V]` option:

**CURRENT:**
```
> **[A]** Apply **[E]** Edit the approach **[S]** Skip
```

**BECOMES:**
```
> **[A]** Apply **[V]** Deep Review **[E]** Edit the approach **[S]** Skip
```

- IF [V]: run Deep Review panel, then re-present this confirmation prompt

---

### Feature Plan — After Plan Approval (step 2 of "After Plan Approval")

**CURRENT:**
```
2. **Write the plan to disk** — save it as `wip/plan-[slug].md`...
3. Fetch `agents/rule-finder.md`...
4. Begin implementation...
```

**ADD between step 2 and step 3:**
```
2a. **Deep Review gate** — before loading the rule-finder or writing any code,
    run the Deep Review panel. This is the last checkpoint before implementation.
    After Deep Review completes (or user skips), continue to step 3.
```

---

## Tasks
- [ ] Fetch current agents/planner.md
- [ ] Add Deep Review section after Feature Plan rules
- [ ] Add [V] to Tactical Plan Step 5 confirm menu
- [ ] Add step 2a Deep Review gate to Feature Plan After Plan Approval
- [ ] Verify the section references are consistent
