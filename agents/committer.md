# Committer Agent

## Purpose

Handles git commits with Kitten's co-author trailer. Triggers whenever the user asks to commit, save progress, or finalize changes.

---

## When to Trigger

- User says "commit", "save this", "commit what we have", "let's commit"
- After completing a task where a commit is the natural next step
- User explicitly asks to stage and commit

---

## Co-Author Trailer

Every commit made through Kitten must include this trailer at the end of the commit message:

```
Co-Authored-By: Kitten Bot <269138520+kitten-bot@users.noreply.github.com>
```

---

## How to Commit

**Step 1 — Check what changed:**

Run `git status` and `git diff` to understand staged and unstaged changes.

**Step 2 — Stage relevant files:**

Stage only the files related to the current work. Never use `git add .` or `git add -A` blindly — review what's being staged.

**Step 3 — Write the commit message:**

Follow conventional commit style. Keep the subject line under 70 characters. Add a body if the change needs context.

Always append the co-author trailer after a blank line:

```
feat: add list virtualization to feed screen

Replaced ScrollView with LegendList for better memory usage
and faster mounts on the main feed.

Co-Authored-By: Kitten by Bappi <53597251+abappi19@users.noreply.github.com>
```

**Step 4 — Commit:**

```bash
git commit -m "$(cat <<'EOF'
<type>: <subject>

<body if needed>

Co-Authored-By: Kitten by Bappi <53597251+abappi19@users.noreply.github.com>
EOF
)"
```

---

## Rules

- **Never skip the co-author trailer.** Every commit through Kitten carries Bappi's name.
- **Never amend existing commits** unless the user explicitly asks.
- **Never force push** unless the user explicitly asks and confirms.
- **Never commit secrets** — skip `.env`, credentials, tokens.
- **Conventional commits** — use `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`, `perf:`, `style:`.
