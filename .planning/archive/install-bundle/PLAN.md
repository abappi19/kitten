# Install Bundle

**Started:** 2026-05-20
**Status:** in-progress

## Problem

Ship kitten-bot as an npm package so anyone can install with `npx kitten-bot install`. CLI prompts for destination (`$PWD/.claude/skills/kitten-bot/` or `~/.claude/skills/kitten-bot/`) or accepts `--local` / `--global` flags.

## Constraints

- Zero npm dependencies — built-ins only (`readline`, `fs.cp`). Keeps `npx` cold-start fast and supply chain tiny.
- Node ≥ 16.7 (for `fs.cp` recursive)
- Cross-platform — no shell-specific paths
- Skill files ship as-is inside the package (no base64, no embedding)
- Package surface limited via `files` whitelist in `package.json`

## Approach

**Package layout:**

```
package.json              # bin, files, version, engines, no deps
bin/cli.js                # argv parse, dispatch
src/commands/install.js   # prompt + copy
src/utils/prompt.js       # readline wrapper
assets/skill/             # the boot kit that gets installed
scripts/sync-assets.js    # mirrors canonical source files → assets/skill/
```

**Why `assets/skill/`:** clean separation. Repo root has dev surfaces (`eval-viewer/`, `references/`, `test-workspace/`); package ships exactly what's in `assets/skill/`. Sync script keeps it mirrored.

**CLI surface:**

- `npx kitten-bot install` — prompts destination, copies `assets/skill/` to chosen path
- `npx kitten-bot install --local` / `--global` — skip prompt
- Bare `npx kitten-bot` — print usage

**Install flow:**

1. Parse argv (subcommand + flags)
2. Resolve destination (flag or prompt)
3. `fs.cp(assetsDir, destDir, { recursive: true, force: true })`
4. Print summary

**Sync (replaces the bash generator):** `npm run sync` → `node scripts/sync-assets.js`. Copies canonical files from repo root into `assets/skill/`. Wired as `prepublishOnly` so the published artifact is always fresh.

**Boot kit shipped in `assets/skill/`:**

- `SKILL.md`
- `config.template.json`
- `rules/MAP.md`, `rules/CRITICAL.md`
- `agents/session-boot.md`
- `scripts/__init__.py`, `scripts/k_load.py`
- `.env.example` — placeholder for `GITHUB_TOKEN`

Remote files (full `agents/`, `references/`) stay remote and load via `k_load.py` at runtime.

## Risks & Edge Cases

- **Name availability:** `kitten-bot` may be taken on npm. Check `npm view kitten-bot` before publish; fall back to `@abappi19/kitten-bot` if taken. Not blocking the build.
- **Existing dest files:** overwrite by default. Print each path as it writes.
- **Missing parents:** `fs.cp` with `recursive: true` creates them.
- **Permissions:** `#!/usr/bin/env node` shebang on `bin/cli.js`; npm sets +x via `bin` field automatically.
- **Bare invocation:** `npx kitten-bot` with no subcommand prints usage and exits 0.

## Tasks

- [ ] Draft `wip/package.md` → `package.json`
- [ ] Draft `wip/cli.md` → `bin/cli.js`
- [ ] Draft `wip/cmd-install.md` → `src/commands/install.js`
- [ ] Draft `wip/prompt.md` → `src/utils/prompt.js`
- [ ] Draft `wip/sync-assets.md` → `scripts/sync-assets.js`
- [ ] Apply drafts via wip/ cycle on [A]
- [ ] Run `npm run sync` to populate `assets/skill/`
- [ ] Verify: `npm pack --dry-run` + `node bin/cli.js install --local` into `/tmp/kt-test/`
- [ ] Mark plan `done`

## Open Questions

None — defaults locked: zero deps, overwrite, flags + interactive fallback, boot-kit-only ship.
