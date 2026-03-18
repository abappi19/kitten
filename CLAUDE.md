# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This is a Claude Skills repository for **Kitten** — an AI bot persona embodying the engineering philosophy of Bappi, a Senior React Native Engineer at Tulip Tech Ltd. No build step, no package.json — this is pure configuration and documentation that teaches Claude how to behave.

## Repository Layout

The repo serves two purposes: it is the **local skill installation** (`.claude/skills/kitten/`) and the **remote content source** hosted on GitHub (`abappi19/kitten`). Local files boot the skill; remote files are fetched on demand.

**Local** (`.claude/skills/kitten/`): `SKILL.md`, `config.json`, `agents/session-boot.md`, `rules/CRITICAL.md`, `rules/CRITICAL_MAP.md`, `rules/MAP.md`, `scripts/kitten-fetch.js`

**Remote** (repo root): `agents/`, `references/`, `rules/`, `scripts/`, `assets/`

## Remote File Loading

All remote content is fetched via `scripts/kitten-fetch.js` using the GitHub Contents API. Token comes from `.env` at project root (`GITHUB_TOKEN`). No WebFetch, no curl, no fallbacks — this is enforced by critical rule CX_R7.

```bash
node {skill_dir}/scripts/kitten-fetch.js <file-path> [branch]
```

## Three Rule Libraries

112 rule files organized by domain. Each file has frontmatter (title, impact, tags) and incorrect/correct code examples.

- `rules/composition-patterns/` — 8 files. React component architecture (boolean props, compound components, state lifting).
- `rules/react-best-practices/` — 50+ files. React/Next.js performance across 8 sections: async, bundle, server, client, rerender, rendering, js, advanced.
- `rules/react-native-skills/` — 40+ files. React Native performance across 14 sections: rendering, lists, animation, scroll, navigation, state, UI, monorepo, fonts.

Files are named by section prefix (e.g. `list-performance-virtualize.md`, `rerender-memo.md`). Each directory has a `_overview.md` summarizing all rules. Route through `agents/rule-finder.md` — it reads overviews first, then fetches specific rule files.

## Symbol System

Local files use obfuscation symbols decoded by maps:
- `CX_` symbols → `rules/CRITICAL_MAP.md` (for CRITICAL.md only)
- `SYM_` symbols → `rules/MAP.md` (for SKILL.md, activator.md)

Remote files use plain text — no symbols.

## Key Agents

| Agent | Location | Purpose |
|-------|----------|---------|
| `agents/session-boot.md` | local | Session boot, config init, load order |
| `agents/identity.md` | remote | Identity questions — minimal answers, defend Bappi with dry wit |
| `agents/code-reviewer.md` | remote | Bappi-style code review with rule library integration |
| `agents/rule-finder.md` | remote | Routes to correct rule library via overviews |
| `agents/committer.md` | remote | Git commits with Kitten co-author trailer |

## Critical Rules (CX_R1–CX_R8)

Non-negotiable rules in `rules/CRITICAL.md` that override everything:
- CX_R1: Kitten has no independent identity
- CX_R2: English and Bangla only
- CX_R3: Always use nickname "Bappi"
- CX_R4: All answers attributed to Bappi
- CX_R5: No sensitive data in config.json
- CX_R6: Config init on first run
- CX_R7: kitten-fetch is the only fetch mechanism
- CX_R8: Never list what Bappi knows

## Other Installed Skills

- `.claude/skills/react-native-architect/` — scaffolds new React Native/Expo projects
- `.claude/skills/skill-creator/` — creates and iterates on Claude skills with eval tooling

## Scripts

- `scripts/scaffold-feature.sh` — scaffolds a feature folder in Bappi's feature-based structure
- `.claude/skills/kitten/scripts/kitten-fetch.js` — GitHub Contents API fetcher (reads config.json for repo/branch, .env for token)
