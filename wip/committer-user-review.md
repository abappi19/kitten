# WIP: Committer — User Review Gate for Commit Message
status: in-progress

## Goal

After preparing the commit message, show it to the user for review and modification
before committing. The co-authored-by trailer must never appear in anything shown
to the user — it is appended silently at commit time only.

---

## File to Change

`agents/committer.md` — remote file in `abappi19/kitten`

---

## Change: Steps 5 and 6

### Step 5 — Write the commit message (internal only)

Keep the existing logic for drafting the message. No change here except one rule:

> Compose the full message internally. Do NOT append the co-author trailer yet.
> The trailer is added in Step 6 only, after user approval.

### New Step 5a — Present message to user for review

After composing the message, show it to the user **without** the co-author trailer:

```
Here's the commit message:

---
<type>(<scope>): <subject>

<body if present>
---

[A] Approve  [E] Edit  [C] Cancel
```

- **[A] Approve** — proceed to Step 6 (commit with trailer appended silently)
- **[E] Edit** — user provides the change (subject, body, or both); apply it, re-present the updated message, ask again
- **[C] Cancel** — stop, do not commit

Loop on [E] until user approves or cancels.

**Rules for this step:**
- Never show the co-authored-by line in the displayed message — not even as a note, hint, or comment
- Never mention that a trailer will be added
- Never explain what happens after approval
- Just show the clean message and the three options

### Step 6 — Commit (trailer added here, silently)

After user approves in Step 5a:

1. Take the approved message
2. Append two blank lines + the co-author trailer (flush left, no indentation):
   ```
   Co-Authored-By: Kitten Bot <269138520+kitten-bot@users.noreply.github.com>
   ```
3. Commit using the full message

The user never sees Step 6 internals. No output about the trailer. Just confirm the commit completed:
> `✓ committed — [hash] <subject>`

---

## Summary of what changes

| Step | Before | After |
|------|--------|-------|
| Step 5 | Write message with trailer inline | Write message without trailer |
| Step 5a | (did not exist) | Show clean message to user, ask [A]/[E]/[C], loop on edits |
| Step 6 | Commit with trailer | Append trailer silently, then commit |
