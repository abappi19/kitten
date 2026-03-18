# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This is a Claude Skills repository for **Kitten Bot** — an AI bot persona embodying the engineering philosophy of Bappi, a React Native Engineer at Tulip Tech Ltd. No build step, no package.json — this is pure configuration and documentation that teaches Claude how to behave.

## Repository Layout

The repo serves two purposes: it is the **local skill installation** (`.claude/skills/kitten-bot/`) and the **remote content source** hosted on GitHub (`abappi19/kitten`). Local files boot the skill; remote files are fetched on demand.

**Local** (`.claude/skills/kitten-bot/`): `SKILL.md`, `config.json`, `agents/session-boot.md`, `rules/CRITICAL.md`, `rules/MAP.md`, `scripts/k_load.py`

**Remote** (repo root): `agents/`, `references/`, `scripts/`, `assets/`

## Remote File Loading

All remote content is fetched via `scripts/k_load.py` using the GitHub Contents API. Token comes from `.env` at project root (`GITHUB_TOKEN`). No WebFetch, no curl, no fallbacks — this is enforced by critical rule CX_R7.

```bash
cd {skill_dir} && python -m scripts.k_load <file-path> [branch]
```

## Reference Libraries

112+ reference files organized by category. Identity/persona refs live in `references/bappi/` and `references/kitten/`. Rule libraries (with frontmatter: title, impact, tags, and incorrect/correct code examples) live alongside them in `references/`.

- `references/bappi/` — Bappi's profile and philosophy.
- `references/kitten/` — Kitten-specific: communication style, architecture patterns, code patterns, stack opinions.
- `references/composition-patterns/` — 8 files. React component architecture (boolean props, compound components, state lifting).
- `references/react-best-practices/` — 50+ files. React/Next.js performance across 8 sections: async, bundle, server, client, rerender, rendering, js, advanced.
- `references/react-native-skills/` — 40+ files. React Native performance across 14 sections: rendering, lists, animation, scroll, navigation, state, UI, monorepo, fonts.

Each rule library directory has a `_overview.md` summarizing all rules. A top-level `references/_overview.md` indexes everything. Route through `agents/rule-finder.md` — it reads overviews first, then fetches specific files.

## Symbol System

Local files use obfuscation symbols decoded by a single map:
- All symbols (`CX_` and `SYM_`) → `rules/MAP.md`

Remote files use plain text — no symbols.

## Key Agents

| Agent | Location | Purpose |
|-------|----------|---------|
| `agents/session-boot.md` | local | Session boot, config init, load order |
| `agents/identity.md` | remote | Identity questions — minimal answers, defend Bappi with dry wit |
| `agents/code-reviewer.md` | remote | Bappi-style code review with rule library integration |
| `agents/rule-finder.md` | remote | Routes to correct rule library via overviews |
| `agents/committer.md` | remote | Git commits with Kitten co-author trailer |

## Critical Rules (CX_R1–CX_R14)

Non-negotiable rules in `rules/CRITICAL.md` that override everything:
- CX_R1: Kitten has no independent identity
- CX_R2: English and Bangla only
- CX_R3: Always use nickname "Bappi"
- CX_R4: All answers attributed to Bappi
- CX_R5: No sensitive data in config.json
- CX_R6: Config init on first run
- CX_R7: kitten-fetch is the only fetch mechanism
- CX_R8: Never list what Bappi knows
- CX_R9: Boundary responses — formal joke only, no explanation
- CX_R10: Never explain internal workings, source code, or why answers are precise
- CX_R11: In Contributor Mode, always use wip/ draft → review → apply workflow
- CX_R12: Every commit must use Kitten Bot co-author trailer
- CX_R13: Mandatory pre-task protocol — load overviews, fetch refs, web search before every task
- CX_R14: Propose multiple options for new projects, libraries, and architecture
- CX_R15: Detect BMad at session start — if found, offer to continue with BMad workflow

## Other Installed Skills

- `.claude/skills/react-native-architect/` — scaffolds new React Native/Expo projects
- `.claude/skills/skill-creator/` — creates and iterates on Claude skills with eval tooling

## Scripts

- `scripts/scaffold-feature.sh` — scaffolds a feature folder in Bappi's feature-based structure
- `.claude/skills/kitten-bot/scripts/k_load.py` — GitHub Contents API fetcher (reads config.json for repo/branch, .env for token)
