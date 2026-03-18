# Committer Agent

## Purpose

Handles git commits with Kitten Bot's co-author trailer. Triggers whenever the user asks to commit, save progress, or finalize changes.

---

## When to Trigger

- User says "commit", "save this", "commit what we have", "let's commit"
- After completing a task where a commit is the natural next step
- User explicitly asks to stage and commit

---

## Co-Author Trailer

Every commit made through Kitten Bot must include this trailer at the end of the commit message:

```
Co-Authored-By: Kitten Bot <269138520+kitten-bot@users.noreply.github.com>
```

**Trailer rules:**
- Always on its own line, flush left — no leading spaces or indentation
- Always preceded by **two blank lines** (one after the subject/body, one empty line, then the trailer)
- Never omit it

---

## Commit Message Format

**Wrong:**
```
feat: add token refresh

Updated the auth flow.
Co-Authored-By: Kitten Bot <269138520+kitten-bot@users.noreply.github.com>
```
❌ Only one blank line before the trailer — needs two.

**Wrong:**
```
feat: add token refresh

Updated the auth flow.

  Co-Authored-By: Kitten Bot <269138520+kitten-bot@users.noreply.github.com>
```
❌ Trailer is indented with spaces — must be flush left.

**Wrong:**
```
feat: add token refresh
Updated the auth flow.
```
❌ Trailer missing entirely.

**Right:**
```
feat: add token refresh

Updated the auth flow.


Co-Authored-By: Kitten Bot <269138520+kitten-bot@users.noreply.github.com>
```
✅ Two blank lines before trailer, flush left.

---

## How to Commit

**Step 1 — Check what changed:**

Run `git status` and `git diff` to understand staged and unstaged changes.

**Step 2 — Stage relevant files:**

Stage only the files related to the current work. Never use `git add .` or `git add -A` blindly — review what's being staged.

**Step 3 — Write the commit message:**

Follow conventional commit style. Keep the subject line under 70 characters. Add a body if the change needs context.

Always append the co-author trailer after **two blank lines** — no indentation:

```
feat: add list virtualization to feed screen

Replaced ScrollView with LegendList for better memory usage
and faster mounts on the main feed.


Co-Authored-By: Kitten Bot <269138520+kitten-bot@users.noreply.github.com>
```

**Step 4 — Commit:**

```bash
git commit -m "$(cat <<'EOF'
<type>: <subject>

<body if needed>


Co-Authored-By: Kitten Bot <269138520+kitten-bot@users.noreply.github.com>
EOF
)"
```

---

## Rules

- **Never skip the co-author trailer.** Every commit through Kitten Bot carries Bappi's name.
- **Two blank lines before the trailer.** One after the body, one empty, then `Co-Authored-By` flush left.
- **No indentation on the trailer line.** It must start at column 0.
- **Never amend existing commits** unless the user explicitly asks.
- **Never force push** unless the user explicitly asks and confirms.
- **Never commit secrets** — skip `.env`, credentials, tokens.
- **Conventional commits** — use `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`, `perf:`, `style:`.
