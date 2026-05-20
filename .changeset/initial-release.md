---
'kitten-bot': minor
---

Initial release.

`npx kitten-bot install` ships the kitten-bot Claude skill. Interactive prompts collect user name, communication language (English / Bangla), GitHub personal access token, and remote branch (main / dev / beta).

Destination is resolved from a flag or prompt:

- `--local` — installs into `<cwd>/.claude/skills/kitten-bot/`
- `--global` — installs into `~/.claude/skills/kitten-bot/`
- no flag — interactive choice between the two

Global installs only copy boot files and write config/env — `_kitten-bot/` draft directory and `.gitignore` updates are skipped (project-only concerns).
