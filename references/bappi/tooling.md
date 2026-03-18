---
title: Bappi's Tooling Setup
description: Biome config (formatting + linting), Husky git hooks, Commitlint conventions (including wip/hotfix types), Changesets release management, bun as package manager, EAS build profiles, the verify script, and dead code/dep-sync tools.
type: reference
when_to_load: When setting up a new project's tooling, reviewing DX config, writing commit messages, or troubleshooting lint/format/hook failures.
---

# Bappi's Tooling Setup

## Biome (Lint + Format)

Biome replaces both ESLint and Prettier. One tool, one config, no conflicts.

```json
{
    "$schema": "https://biomejs.dev/schemas/2.3.7/schema.json",
    "files": {
        "ignoreUnknown": false,
        "includes": [
            "**",
            "!app.json", "!eas.json", "!.changeset/**/*",
            "!.github/**/*", "!.husky/**/*", "!.vscode/**/*",
            "!ios/**/*", "!android/**/*", "!node_modules/**/*",
            "!assets/**/*", "!.expo/**/*", "!.eas/**/*"
        ]
    },
    "formatter": {
        "enabled": true,
        "indentStyle": "tab"
    },
    "linter": {
        "enabled": true,
        "rules": {
            "recommended": true,
            "suspicious": { "noExplicitAny": "warn" },
            "style": {
                "useConst": "warn",
                "useConsistentArrayType": "warn"
            }
        }
    },
    "javascript": {
        "formatter": {
            "quoteStyle": "double",
            "arrowParentheses": "asNeeded",
            "trailingCommas": "es5",
            "indentWidth": 4,
            "indentStyle": "tab",
            "lineWidth": 120,
            "jsxQuoteStyle": "double"
        }
    },
    "json": {
        "formatter": {
            "indentWidth": 4,
            "indentStyle": "tab",
            "lineWidth": 120
        }
    },
    "assist": {
        "enabled": true,
        "actions": {
            "source": { "organizeImports": "off" }
        }
    }
}
```

**Summary:** tabs, indent 4, line-width 120, double quotes, trailing commas ES5, `any` is a warning not an error.

### Scripts

```json
"scripts": {
    "lint": "bun run biome:check",
    "lint:fix": "bun run biome:check:fix",
    "format": "bun run biome:format",
    "format:fix": "bun run biome:format:fix",
    "biome:check": "biome check",
    "biome:check:fix": "biome check --fix",
    "biome:format": "biome format",
    "biome:format:fix": "biome format --fix",
    "verify": "bun run lint && bun run type-check"
}
```

`verify` is the pre-push gate — always lint + type-check together.

---

## Commitlint

Extends conventional commits and adds `wip` and `hotfix` types. Scope is always required.

```ts
// commitlint.config.ts
import type { UserConfig } from "@commitlint/types";

const Configuration: UserConfig = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "scope-enum": [2, "always", ["app", "release"]],  // add feature scopes here
        "scope-empty": [2, "never"],                       // scope required
        "type-enum": [2, "always", [
            "build", "chore", "ci", "docs", "feat", "fix",
            "perf", "refactor", "revert", "style", "test",
            "wip",     // work in progress — allowed in feature branches
            "hotfix",  // emergency fix
        ]],
    },
};

export default Configuration;
```

**Commit message format:** `type(scope): description`
```
feat(auth): add social login with Apple
fix(app): resolve token refresh race condition
wip(profile): incomplete portfolio upload screen
hotfix(api): handle 503 on startup
```

---

## Husky Git Hooks

Three hooks, all enforced:

**.husky/pre-commit:**
```sh
#!/bin/sh
bun run lint
bun run format
bun run type-check
```

**.husky/commit-msg:**
```sh
#!/bin/sh
bunx commitlint --edit "$1"
```

**.husky/post-merge:**
```sh
#!/bin/sh
bun run prepare && bun install
```

`post-merge` ensures deps are installed when someone pulls changes that add/remove packages.

`prepare` script in package.json: `"prepare": "husky"` — sets up hooks on install.

---

## Package Manager

| Context | Manager | Config file |
|---------|---------|-------------|
| New standalone apps | `bun` | `bun.lock` |
| Older standalone apps | `yarn` 1.22.x | `yarn.lock` |
| Yarn PnP apps | `yarn` with `.yarnrc.yml` | `.pnp.cjs` |
| Native + web monorepo | `pnpm` | `pnpm-workspace.yaml` |
| Cross-platform monorepo | `yarn` 4 | `yarn.lock` + workspaces |

The canonical choice for new projects is `bun`. Force it in `package.json`:
```json
"engines": {
    "bun": ">=1.2.9",
    "npm": "please_use_bun",
    "yarn": "please_use_bun",
    "pnpm": "please_use_bun"
}
```

---

## Changesets (Release Management)

Used for managing version bumps and changelogs in published packages:

```json
"scripts": {
    "release": "changeset",
    "release:version": "changeset version",
    "release:publish": "changeset publish",
    "release:add": "changeset add",
    "release:status": "changeset status",
    "release:tag": "changeset tag"
}
```

`.changeset/config.json` — linked to GitHub for changelog automation.

---

## EAS Build Profiles

Three profiles for the full release pipeline:

| Profile | Build type | Distribution | Notes |
|---------|-----------|-------------|-------|
| `development` | Dev client | Internal | iOS simulator, Android APK internal |
| `preview` | Release candidate | Internal APK | For QA/testing |
| `production` | App store | Store | `autoIncrement: true`, `appVersionSource: "remote"` |

`appVersionSource: "remote"` means EAS manages the version number, not `package.json`.

---

## Scaffold Script

```json
"scripts": {
    "scaffold:module": "bun run scripts/scaffold-module.mjs"
}
```

Run: `bun run scaffold:module <feature-name>`

Generates the full feature boilerplate — schema, service, component, screen, and route file — in one command.

---

## Knip (Dead Code Detection)

Used in web monorepos to find unused files and exports:

```ts
// knip.config.ts
export default {
    workspaces: {
        ".": { entry: ["index.ts"] },
        "apps/web": { entry: ["src/index.tsx"] },
    },
};
```

```json
"depcheck": "knip --dependencies"
```

---

## Syncpack (Dependency Version Sync)

Used in monorepos to ensure consistent versions across all packages:

```json
// .syncpackrc.json
{
    "semverGroups": [{ "range": "^", "dependencies": ["**"] }]
}
```

```json
"syncpack:check": "syncpack list-mismatches",
"syncpack:fix": "syncpack fix-mismatches"
```

---

## VSCode Config

`.vscode/settings.json` in every project:
```json
{
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.biome": "explicit"
    }
}
```

`.vscode/extensions.json`:
```json
{
    "recommendations": ["biomejs.biome", "dbaeumer.vscode-eslint"]
}
```
