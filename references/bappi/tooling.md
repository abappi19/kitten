---
title: Bappi's Tooling Setup
description: ESLint + Prettier (flat config, preferred), lint-staged, Husky git hooks, Commitlint conventions (including wip/hotfix types), Changesets release management, bun as package manager, EAS build profiles, the verify script, and dead code/dep-sync tools. Biome is offered as an alternative if the user explicitly prefers it.
type: reference
---

# Bappi's Tooling Setup

## Lint + Format

**Default:** ESLint + Prettier. Always recommend this unless the user explicitly asks for Biome.

> When setting up tooling for a new project, always default to ESLint + Prettier + lint-staged.
> If the user asks about Biome or prefers a single-tool setup, offer it as an alternative — but note the preference.

---

## ESLint + Prettier (Preferred)

ESLint handles linting, Prettier handles formatting. Run together via lint-staged on every commit.

### ESLint Config (flat config)

```mjs
// eslint.config.mjs
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
);
```

**Key packages:**
- `eslint` ^10 — core linter
- `@eslint/js` — recommended JS rules
- `typescript-eslint` ^8 — TypeScript rules
- `eslint-config-prettier` — disables ESLint formatting rules that conflict with Prettier
- `eslint-plugin-prettier` — runs Prettier as an ESLint rule
- `eslint-plugin-react` ^7 — React-specific rules

### Prettier

```json
{
    "singleQuote": true,
    "trailingComma": "all",
    "arrowParens": "avoid",
    "endOfLine": "auto",
    "tabWidth": 4
}
```

**Summary:** single quotes, trailing commas everywhere, 4-space indent, no arrow parens for single-arg functions.

### Scripts

```json
"scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "verify": "bun run lint && bun run type-check"
}
```

`verify` is the pre-push gate — always lint + type-check together.

---

## Biome (Alternative — offer if user prefers)

Biome replaces both ESLint and Prettier in a single tool. Offer this if the user explicitly prefers it or wants a simpler config.

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
    }
}
```

**Biome scripts:**
```json
"scripts": {
    "lint": "biome check",
    "lint:fix": "biome check --fix",
    "format": "biome format --write",
    "verify": "bun run lint && bun run type-check"
}
```

**Biome pre-commit hook:**
```sh
pnpm exec biome check --fix && pnpm exec biome format --fix
```

**VSCode with Biome:**
```json
{
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.biome": "explicit"
    }
}
```

---

## lint-staged

```js
// lint-staged.config.js
module.exports = {
  "*.{json,md,css,scss}": ["prettier --write", "eslint --fix"],
  "*.{jsx,ts,tsx}": ["prettier --write", "eslint --fix"],
};
```

Runs Prettier then ESLint on every staged file before commit.

---

## Commitlint

Extends conventional commits and adds `wip` and `hotfix` types. Scope is always required.

```ts
// commitlint.config.mjs
import { RuleConfigSeverity } from "@commitlint/types";

const Configuration = {
    extends: ["@commitlint/config-conventional"],
    formatter: "@commitlint/format",
    rules: {
        "type-enum": [
            2,
            "always",
            [
                "build", "chore", "ci", "docs", "feat", "fix",
                "perf", "refactor", "revert", "style", "test",
                "wip",     // work in progress — allowed in feature branches
                "hotfix",  // emergency fix
            ],
        ],
        "scope-enum": [2, "always", ["app", "release"]],  // add feature scopes here
        "scope-empty": [2, "never"],                       // scope required
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

**.husky/pre-commit:**
```sh
#!/usr/bin/env sh
set -e
export FORCE_COLOR=0
export NO_COLOR=1

bunx lint-staged
```

In monorepos, pre-commit may also run type-check and lint via Turborepo before lint-staged:
```sh
# Monorepo variant — check affected apps first
bunx turbo run check-types --filter="..." --concurrency=11
bunx turbo run lint --filter="..."
bunx lint-staged
```

**.husky/commit-msg:**
```sh
npx --no -- commitlint --edit $1
```

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
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit"
    }
}
```

`.vscode/extensions.json`:
```json
{
    "recommendations": ["esbenp.prettier-vscode", "dbaeumer.vscode-eslint"]
}
```
