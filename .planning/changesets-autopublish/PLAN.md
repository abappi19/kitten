# Changesets Autopublish

**Started:** 2026-05-20
**Status:** in-progress

## Problem

Set up changesets so future PRs auto-publish `kitten-bot` to npm. Fix manifest bloat before first release. Bootstrap registry with `0.1.0` (pre-stable — nothing's shipped yet).

## Constraints

- Monorepo, only `packages/cli` is public. Other workspaces are `private: true`.
- Build needs `GITHUB_TOKEN` (token baked into `k_load.py`). Must be a GH Action secret.
- `NPM_TOKEN` must be a GH Action secret (Bappi adds in repo settings).
- Husky pre-commit must not break on CI (`husky` install guards).
- Bun is the package manager; `changesets/action` shells `npm publish` by default — override with `publish: bun run release`.

## Approach

**Phase 1 — Manifest fix**
Narrow `manifest.ts`: `dirs: ['agents', 'rules']`, `files: ['SKILL.md', 'config.template.json', 'scripts/__init__.py', 'scripts/k_load.py']`. Drops 65 KB of dev/eval python. `copyFile()` in build + `copyFiles` step already handle nested file paths.

**Phase 2 — Install changesets**
`bun add -D -w @changesets/cli` (root workspace dep). `bun changeset init` generates `.changeset/config.json` + README.

**Phase 3 — Config + workflow**

- `.changeset/config.json`: `baseBranch: "main"`, `access: "public"`
- `.github/workflows/release.yml`: trigger on push-to-main → checkout → bun install → bun build (needs `GH_PAT`) → `changesets/action@v1` with `publish: bun run release` + `createGithubReleases: true`
- Root `package.json`: add `"release": "changeset publish"`

**Phase 4 — Version reset**
`packages/cli/package.json`: `1.0.0` → `0.0.0`. Nothing's ever published; a minor changeset then bumps cleanly to `0.1.0` instead of `1.1.0`.

**Phase 5 — Initial changeset**
`.changeset/initial-release.md` with `"kitten-bot": minor` + description covering destination scope feature. First merge → version `0.1.0` → publish.

**Phase 6 — Hand-off**
Bappi adds secrets to GitHub: `NPM_TOKEN` (npm-generated), `GH_PAT` for build. Pushes. CI opens Version Packages PR. Merging it triggers publish.

## Risks

- `GITHUB_TOKEN` collision: workflows have a built-in `GITHUB_TOKEN` — name the build secret `GH_PAT`.
- `changesets/action` needs the workflow `GITHUB_TOKEN` env for PR creation. Both coexist fine.
- Husky on CI: `prepare: husky` runs on `bun install`. Mitigation: `"prepare": "husky || true"` to avoid hard fail.

## Tasks

- [ ] Draft `wip/cli-manifest-narrow.md` → `packages/cli/src/manifest.ts`
- [ ] Apply manifest fix, rebuild, `npm pack --dry-run` shows lean tarball
- [ ] `bun add -D -w @changesets/cli` + `bun changeset init`
- [ ] Draft `wip/changeset-config.md` → `.changeset/config.json`
- [ ] Draft `wip/release-workflow.md` → `.github/workflows/release.yml`
- [ ] Draft `wip/root-package-release-script.md` → root `package.json`
- [ ] Draft `wip/cli-package-version-reset.md` → `packages/cli/package.json`
- [ ] Write `.changeset/initial-release.md` (not via wip — transient changesets artifact)
- [ ] Apply drafts; commit in logical chunks
- [ ] Document hand-off in commit body: `NPM_TOKEN` + `GH_PAT` secrets, merge flow

## Open Questions

None — defaults locked.
