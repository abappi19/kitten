---
title: Bappi's Testing Patterns
description: Testing stack by project type — Vitest for web/monorepo, Jest + jest-expo for RN, msw for API mocking, Detox/Maestro for E2E, Storybook for visual testing. Test conventions, file layout, and pyramid.
type: reference
when_to_load: When writing tests, setting up a test environment, choosing between test libraries, or reviewing test structure.
---

# Bappi's Testing Patterns

## Core Philosophy: Test Behavior, Not Implementation

Don't test that a function was called. Test what the user sees and experiences. Tests should survive refactors — if you rename an internal function and 10 tests break, those tests are testing implementation.

---

## Test Stack by Project Type

| Project type | Unit/Integration | E2E | Visual |
|---|---|---|---|
| Web monorepo (Next.js) | Vitest + React Testing Library | — | — |
| Expo RN app | Jest + jest-expo + React Test Renderer | Detox or Maestro | Storybook (on-device) |
| Shared packages | Vitest (ESM native, faster) | — | — |
| API mocking (any) | msw (Mock Service Worker) | — | — |

---

## File Layout

```
lib/
  services/
    auth/
      __tests__/
        use-auth.service.test.ts   ← Co-located unit tests
  components/
    auth/
      __tests__/
        auth-wrapper.component.test.tsx
tests/
  integration/                    ← Cross-feature integration tests
    auth-onboarding.test.ts
  e2e/                            ← Detox or Maestro scripts
    config/
    specs/
      login.spec.ts
```

---

## Vitest (Web / Shared Packages)

Preferred over Jest for web and monorepo packages — native ESM support, faster, no transform config:

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./tests/setup.ts"],
    },
});
```

```ts
// vitest.workspace.ts (monorepo)
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
    "packages/*/vitest.config.ts",
    "apps/web/vitest.config.ts",
]);
```

---

## Jest + jest-expo (React Native)

```json
// package.json
{
    "jest": {
        "preset": "jest-expo",
        "transformIgnorePatterns": [
            "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
        ]
    }
}
```

---

## msw — API Mocking

Mock fetch at the network boundary — never mock the fetch client itself:

```ts
// tests/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
    http.post("/auth/login", () => {
        return HttpResponse.json({
            user: { id: "1", email: "test@example.com" },
            auth: { jwt: "fake-token", refreshToken: "fake-refresh" },
        });
    }),

    http.get("/auth/user", ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth) return new HttpResponse(null, { status: 401 });
        return HttpResponse.json({ user: { id: "1" } });
    }),
];
```

```ts
// tests/setup.ts
import { setupServer } from "msw/node";
import { handlers } from "./mocks/handlers";

const server = setupServer(...handlers);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## React Testing Library (Native)

```ts
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";

describe("LoginScreen", () => {
    it("shows error message on invalid credentials", async () => {
        render(<LoginScreen />);

        fireEvent.changeText(screen.getByPlaceholderText("Email"), "test@example.com");
        fireEvent.changeText(screen.getByPlaceholderText("Password"), "wrongpass");
        fireEvent.press(screen.getByText("Sign In"));

        await waitFor(() => {
            expect(screen.getByText("Invalid credentials")).toBeTruthy();
        });
    });
});
```

Query by what the user sees — text, placeholder, role. Never by component name or test ID unless necessary.

---

## Testing Hook Behavior

```ts
import { renderHook, act } from "@testing-library/react-native";

describe("useLogin", () => {
    it("clears tokens on logout", async () => {
        const { result } = renderHook(() => useLogout(), { wrapper: QueryProvider });

        await act(async () => {
            await result.current.mutateAsync();
        });

        expect(await TokenService.getToken()).toBeNull();
    });
});
```

---

## Storybook (Visual Testing)

Used for isolated component development:

```ts
// MyButton.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-native";
import { Button } from "./button.ui";

const meta: Meta<typeof Button> = {
    title: "UI/Button",
    component: Button,
};

export default meta;

export const Default: StoryObj<typeof Button> = {
    args: { text: "Click me", onPress: () => {} },
};

export const Loading: StoryObj<typeof Button> = {
    args: { text: "Loading...", isLoading: true, onPress: () => {} },
};
```

---

## E2E (Maestro)

```yaml
# tests/e2e/specs/login.yaml
appId: com.mycompany.myapp
---
- launchApp
- assertVisible: "Sign In"
- tapOn: "Email"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "Password123"
- tapOn: "Sign In"
- assertVisible: "Home"
```

Maestro preferred over Detox for new projects — simpler YAML syntax, faster setup.

---

## Test Pyramid

```
        ┌─────────────┐
        │     E2E     │  ← Few. Detox/Maestro. Critical user paths only.
        ├─────────────┤
        │ Integration │  ← Some. Login flow, auth + onboarding together.
        ├─────────────┤
        │    Unit     │  ← Most. Hooks, utils, stores, validation schemas.
        └─────────────┘
```

Most coverage at the bottom — fast, isolated. E2E only for the most critical paths.

---

## What to Test

| Layer | Test what |
|-------|-----------|
| Zod schemas | Valid and invalid inputs, cross-field rules |
| Zustand stores | State transitions, persistence |
| Custom hooks (useQuery/useMutation) | Success/error state, side effects |
| UI components | Renders correctly, responds to user events |
| Auth flow | Token set/cleared, navigation, error messages |
| E2E | Login, registration, core feature happy path |

---

## BAD vs GOOD

```ts
// ❌ BAD — testing implementation detail
expect(fetchClient.post).toHaveBeenCalledWith("/auth/login", ...);

// ✅ GOOD — testing behavior
await waitFor(() => expect(screen.getByText("Welcome back!")).toBeTruthy());
```

```ts
// ❌ BAD — mocking the fetch client
jest.mock("@/lib/config/api/fetch-client.config");

// ✅ GOOD — mocking at the network level via msw
server.use(http.post("/auth/login", () => HttpResponse.json({ ... })));
```
