---
title: Bappi's CI/CD Patterns
description: EAS build profiles, GitHub Actions for mobile builds, Jenkins for backend microservice deployments, release-please, and the branch-to-environment mapping.
type: reference
---

# Bappi's CI/CD Patterns

## Branch → Environment Mapping

| Branch | Environment | Build Profile / Pipeline |
|--------|------------|--------------------------|
| `feature/*`, `fix/*` | Local dev | Dev client |
| `develop` | Development | EAS `development`, Backend `dev` |
| `staging` | Staging | EAS `preview`, Backend `staging` |
| `main` / `prod` | Production | EAS `production`, Backend `prod` |

---

## EAS Build Profiles

```json
{
    "build": {
        "base": {
            "node": ">=24.11.0",
            "bun": ">=1.2.9"
        },
        "development": {
            "extends": "base",
            "developmentClient": true,
            "distribution": "internal",
            "env": { "APP_ENV": "development" },
            "android": {
                "buildType": "apk",
                "withoutCredentials": true
            },
            "ios": {
                "simulator": true
            }
        },
        "preview": {
            "extends": "base",
            "distribution": "internal",
            "env": { "APP_ENV": "staging" },
            "android": {
                "buildType": "apk"
            },
            "ios": {
                "simulator": false
            }
        },
        "production": {
            "extends": "base",
            "autoIncrement": true,
            "appVersionSource": "remote",
            "env": { "APP_ENV": "production" }
        }
    },
    "submit": {
        "production": {
            "ios": {
                "appleId": "...",
                "ascAppId": "...",
                "appleTeamId": "..."
            },
            "android": {
                "serviceAccountKeyPath": "./service-account.json",
                "track": "internal"
            }
        }
    }
}
```

`appVersionSource: "remote"` — EAS manages the version number automatically. No manual bumps in `package.json`.

---

## GitHub Actions (EAS Build)

```yaml
# .github/workflows/release-ci-cd.yml
name: EAS Build

on:
    push:
        branches: [main, staging, develop]

jobs:
    build:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - uses: actions/setup-node@v4
              with:
                  node-version: 20

            - uses: oven-sh/setup-bun@v2
              with:
                  bun-version: latest

            - name: Install dependencies
              run: bun install

            - name: Type check
              run: bun run type-check

            - uses: expo/expo-github-action@v8
              with:
                  eas-version: latest
                  token: ${{ secrets.EXPO_TOKEN }}

            - name: Build (development)
              if: github.ref == 'refs/heads/develop'
              run: eas build --profile development --platform all --non-interactive

            - name: Build (preview)
              if: github.ref == 'refs/heads/staging'
              run: eas build --profile preview --platform all --non-interactive

            - name: Build (production)
              if: github.ref == 'refs/heads/main'
              run: eas build --profile production --platform all --non-interactive
```

---

## EAS Update (OTA)

For minor JS-only fixes without a full store build:

```yaml
- name: Publish OTA update
  run: eas update --branch ${{ github.ref_name }} --message "${{ github.event.head_commit.message }}"
```

`runtimeVersion: { policy: "appVersion" }` in `app.config.ts` ensures OTA updates only go to compatible native builds.

---

## Jenkins Pipeline (Backend Microservices)

```groovy
pipeline {
    agent any

    stages {
        stage("Checkout") {
            when {
                anyOf {
                    branch "develop"
                    branch "staging"
                    branch "prod"
                }
            }
            steps { checkout scm }
        }

        stage("Get env") {
            steps {
                // Pull .env from Vault or credential store
                sh "cp /vault/secrets/.env.${BRANCH_NAME} .env"
            }
        }

        stage("Build Images") {
            parallel {
                stage("Gateway") {
                    steps { sh "docker build -f apps/gateway/Dockerfile -t registry/gateway:${BUILD_NUMBER} ." }
                }
                stage("Auth") {
                    steps { sh "docker build -f apps/auth/Dockerfile -t registry/auth:${BUILD_NUMBER} ." }
                }
                stage("Client") {
                    steps { sh "docker build -f apps/client/Dockerfile -t registry/client:${BUILD_NUMBER} ." }
                }
                stage("Socket") {
                    steps { sh "docker build -f apps/socket/Dockerfile -t registry/socket:${BUILD_NUMBER} ." }
                }
                stage("Utility") {
                    steps { sh "docker build -f apps/utility/Dockerfile -t registry/utility:${BUILD_NUMBER} ." }
                }
            }
        }

        stage("Push to Registry") {
            steps { sh "docker push registry/..." }
        }

        stage("Deploy") {
            steps {
                sh "ssh deploy@server 'cd /srv/app && ./deploy.sh ${BUILD_NUMBER}'"
            }
        }
    }

    post {
        always {
            office365ConnectorSend(
                status: currentBuild.currentResult,
                webhookUrl: env.TEAMS_WEBHOOK_URL
            )
        }
    }
}
```

Key patterns:
- Parallel Docker builds for all microservices
- Images tagged with build number (not `latest`)
- Deploy via SSH + deploy script on the server
- MS Teams webhook notification on every build

---

## release-please (Web/Monorepo)

Used in web monorepos for automated changelog and version management:

```yaml
# .github/workflows/release-please.yml
name: Release Please

on:
    push:
        branches: [main]

jobs:
    release-please:
        runs-on: ubuntu-latest
        steps:
            - uses: googleapis/release-please-action@v4
              with:
                  release-type: node
                  token: ${{ secrets.GITHUB_TOKEN }}
```

---

## PR Template

```markdown
## Summary
<!-- What does this PR do? -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactor
- [ ] Breaking change

## Test Plan
- [ ] Unit tests pass: `bun run test:unit`
- [ ] Type check passes: `bun run type-check`
- [ ] Lint passes: `bun run lint`
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
```

---

## `.easignore`

Exclude files from EAS build uploads:

```
.git
node_modules
*.log
.env
.env.*
!.env.example
.bappis-projects/
```
