<!-- references/bappi/creation-lifecycle.md -->

---

title: Creation Lifecycle
description: Bappi's universal 12-phase execution framework for building anything from scratch — apps, modules, libraries, backends, web apps, shared packages, design systems. Includes hard enforcement rules, phase gates, output schemas, and anti-pattern guards that make it deterministic, not suggestive.
type: reference

---

# Creation Lifecycle

Bappi's execution framework for taking any idea from concept to production. The phases are universal — they apply to mobile apps, Expo modules, npm libraries, backends, web apps, shared packages, and design systems. What changes across domains is the content of each phase, not the sequence.

**When this applies:** any request to create, scaffold, build, or start something from scratch. This is the universal lifecycle. Domain-specific agents (e.g., `agents/project-bootstrap.md` for new apps) implement specific phases of this lifecycle — they don't replace it.

**Execution:** follows `references/kitten/execution-contract.md`.
Gates: Phase 1 → 2, Phase 2 → 3, Phase 3 → 4 (hard gates — no code before Phase 4).
Schema: each phase uses `**Phase X — [Name]**` label + Domain, Decisions, Output, Open Questions, Next.

**Persistence:** all lifecycle output is written to `.planning/[slug]/` per `references/kitten/planning-directory.md`. Each phase maps 1:1 to `phases/phase-XX-[name].md`.

---

## Phase 0 — WIP Continuation Check

Run the WIP Continuation Check from `agents/planner.md`. If an in-progress Creation Lifecycle initiative exists in `.planning/PLAN.md`, resume it before starting a new one. Silent if nothing is in progress.

---

## Phase 1 — Problem Validation & Scope

Don't build "another X." Define the specific gap.

**For every creation task, answer:**

- What problem does this solve that existing solutions don't?
- Who is this for? (team, open source, personal)
- What's the strict MVP vs later features?

**Required output:** 1–2 sentence problem statement + feature scope boundary.

### Domain-specific questions

| Domain                       | Ask                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------- |
| **Mobile app**               | Target platforms? Expo managed or bare? Offline-first?                       |
| **Expo module / RN library** | What's missing in existing packages? Target: managed Expo, bare RN, or both? |
| **Backend / API**            | Microservice or monolith? Auth model? Expected load?                         |
| **Web app**                  | SSR/SSG/SPA? SEO requirements? Target framework?                             |
| **Shared package**           | Who consumes this — mobile, web, both? What's the dependency boundary?       |
| **Design system**            | Platforms? Token-based? Component library or tokens only?                    |

---

## Phase 2 — Technical Feasibility (Spike)

Before committing, validate that the approach works.

**Universal checks:**

- Can the platform APIs support the core requirement?
- Are there permission, security, or performance constraints?
- What are the known limitations?

**Do a quick POC:** prove the single hardest technical assumption. One file. One test. If this fails, the project shape changes.

**Required output:** "Yes, feasible" + known limitations, or "No — here's why" + alternative approach.

### Domain-specific spikes

| Domain             | Spike                                                             |
| ------------------ | ----------------------------------------------------------------- |
| **Expo module**    | Create minimal module, call one native API, return result to JS   |
| **Mobile app**     | Prove the core screen/flow works with real data                   |
| **Backend**        | Prove the critical endpoint works with real auth + DB             |
| **Web app**        | Prove the rendering strategy (SSR/SSG) works with the data source |
| **Shared package** | Prove the package builds and imports correctly in both consumers  |

---

## Phase 3 — Architecture & API Design

Define how it works internally. This is the contract everything else builds on. **Never skipped.**

**Universal decisions:**

- API surface / public interface
- Internal component boundaries
- Data flow and state ownership
- Error handling strategy

**Required output:** API contract (typed interface or function signatures) + module/component boundary diagram or description.

### Domain-specific architecture

| Domain             | Key decisions                                                                        |
| ------------------ | ------------------------------------------------------------------------------------ |
| **Expo module**    | Native (Swift + Kotlin) vs JS-only. API shape. Bridge layer. Optional JS UI wrapper. |
| **Mobile app**     | Folder structure. Navigation architecture. State strategy. API layer shape.          |
| **Backend**        | Service boundaries. DB schema. Auth middleware. API contract (REST/GraphQL).         |
| **Web app**        | Rendering strategy. Route structure. Data fetching pattern. Caching layer.           |
| **Shared package** | Export surface. Platform-specific splits (`.native.ts` / `.web.ts`). Peer deps.      |
| **Design system**  | Token structure. Component API patterns. Theming strategy. Platform overrides.       |

---

## Phase 4 — MVP Development

First line of code. Keep it tight — don't overbuild.

**Universal rules:**

- Core functionality only
- Clean typed API surface
- No premature optimization
- No edge-case features yet

**Avoid initially:** heavy customization, plugins, complex configuration, advanced features.

**Focus:** stability, correctness, clean API.

**Required output:** working MVP code via the drafting gate (`_kitten-bot/` or `wip/`).

---

## Phase 5 — Platform Implementation

Build for all target platforms with a parallel mindset.

**Universal rules:**

- Use platform-recommended APIs (not deprecated ones)
- Consistent API response shape across platforms
- Permission handling on every platform
- Test on real devices, not just simulators

### Domain-specific platform concerns

| Domain             | Concern                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **Expo module**    | Swift (iOS) + Kotlin (Android). Permission handling both sides. Consistent return types. |
| **Mobile app**     | iOS + Android behavior parity. Platform-specific UI adaptations. Safe area handling.     |
| **Backend**        | Local dev parity with production. Docker. Environment config.                            |
| **Web app**        | Browser compatibility. Mobile responsive. SSR hydration.                                 |
| **Cross-platform** | Shared logic in packages/. Platform splits where needed.                                 |

---

## Phase 6 — Developer Experience (DX)

This makes or breaks adoption — whether the "developer" is your team or the public.

**Must-have:**

- Clean TypeScript types
- Minimal setup steps
- Works with the target ecosystem's tooling (Expo prebuild, Next.js, etc.)
- Clear error messages with actionable guidance

**Provide:**

- Example app or usage demo
- Inline code comments where behavior isn't obvious

---

## Phase 7 — Packaging & Distribution

Prepare for real usage.

**Universal steps:**

- Structure as a proper package (npm, monorepo workspace, or deployable unit)
- README: clear, visual, installation + quick start + API docs
- Versioning: start with `0.1.0`
- Proper `package.json` fields: `main`, `types`, `exports`, `files`

### Domain-specific packaging

| Domain               | Package shape                                     |
| -------------------- | ------------------------------------------------- |
| **Expo module**      | `expo-module.config.json`, native dirs, TS types  |
| **npm library**      | `src/`, `dist/`, proper `exports` map             |
| **Backend**          | Dockerfile, environment config, migration scripts |
| **Web app**          | Build output, deployment config, CDN setup        |
| **Monorepo package** | Workspace entry, proper `name`, peer deps         |

---

## Phase 8 — Testing Strategy

Don't skip this.

**Universal layers:**

- Manual testing of the core flow
- Edge cases: bad input, permission denied, network failure, large data
- Automated tests where the cost of regression is high

### Domain-specific testing

| Domain             | Focus                                                                      |
| ------------------ | -------------------------------------------------------------------------- |
| **Expo module**    | Real device testing (camera, sensors). Permission edge cases.              |
| **Mobile app**     | Device matrix. Offline behavior. Navigation edge cases. Maestro/Detox E2E. |
| **Backend**        | Integration tests with real DB. Auth flow. Load testing.                   |
| **Web app**        | Cross-browser. Lighthouse. Accessibility.                                  |
| **Shared package** | Consumer integration tests. Build verification in all target apps.         |

---

## Phase 9 — Publishing / Deployment

Ship it.

**For packages:**

- npm publish with proper tags
- GitHub release with changelog
- Screenshots / GIF demos in README

**For apps / backends:**

- CI/CD pipeline
- Staging environment first
- Production deploy with monitoring

---

## Phase 10 — Feedback Loop & Iteration

First version will not be perfect.

**Collect feedback:**

- GitHub issues (packages)
- User testing (apps)
- Monitoring + logs (backends)

**Then iterate:** address real pain points, not hypothetical ones.

---

## Phase 11 — Growth Strategy (Optional)

If adoption matters:

- Write an article: "Why [existing solution] wasn't enough"
- Share in relevant communities
- Submit to ecosystem directories (Expo, npm trending, etc.)

---

## Phase 12 — Long-Term Evolution

Turn it into a serious product.

- Plugin / extension system
- Advanced features per domain
- Additional platform support
- Performance optimizations
- Community contributions

---

## Reality Check

Any creation is only worth building if it has at least one of:

- **Better DX** than existing alternatives
- **Specific gap filled** that nothing else covers
- **Performance advantage** in a measurable way

If it's just a wrapper or a copy, it won't get traction — and the time is better spent elsewhere.

---

## Planner Integration

When the planner classifies a task as creation / greenfield:

1. **Fetch this reference** — `references/bappi/creation-lifecycle.md`
2. **Classify the domain** — app, module, library, backend, web app, package, design system
3. **Determine execution mode** — Strict (default), Fast Track, or Expert based on user signals
4. **Start at Phase 1** — problem statement and scope. Follow the output schema.
5. **Walk phases sequentially** — each phase produces structured output, waits for confirmation at gates
6. **Phase 4+ uses the drafting gate** — `_kitten-bot/` or `wip/` depending on mode
7. **Domain-specific agents** (e.g., project-bootstrap for apps) can handle specific phases, but the lifecycle governs the sequence
8. **Persistence** — every phase's output is written to `.planning/[slug]/phases/phase-XX-[name].md` per `references/kitten/planning-directory.md`. Slug defaults to the artifact name. The initiative's `PLAN.md` holds Problem, Approach, and the Phase Index.

**CX_R14 still applies:** within each phase, when there are meaningful choices (folder structure, libraries, architecture patterns), present options with trade-offs. One decision at a time.
