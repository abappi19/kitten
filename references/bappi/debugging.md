---
title: Bappi's Debugging Patterns
description: Iron Law (root cause first), 3-attempts architecture checkpoint, structured error logging in catch blocks, Reactotron setup, Flash Message for user-facing errors, platform-aware error context, and the debugging sequence Bappi follows when something breaks.
type: reference
---

# Bappi's Debugging Patterns

## Debugging Sequence

When something is broken, work from outside in:

1. **Read the error message** — don't assume. Read it fully.
2. **Check the network layer first** — is the request going out? Is the response correct? Open the network tab / Reactotron / proxy.
3. **Check the data** — log the actual value at the point of failure, not before or after.
4. **Trace the boundary** — where does control transfer from one layer to another? That's where to look.
5. **Check the type** — runtime type mismatches are a common source of silent failures in JS.
6. **Reproduce minimally** — isolate the failing case. Remove everything that isn't relevant.
7. **Check platform differences** — many bugs are iOS-only, Android-only, or web-only. Always check.

---

## Structured Error Logging (FetchClient)

Errors at the fetch boundary include all context needed to diagnose remotely:

```ts
console.error("FetchClient Catch Block:", {
    error,
    errorType: typeof error,
    errorConstructor: error?.constructor?.name,
    errorMessage: error instanceof Error ? error.message : String(error),
    errorStack: error instanceof Error ? error.stack : undefined,
    url,
    method: options.method || "GET",
    platform: Platform.OS,
});
```

**Pattern:** always log the URL, method, platform, and error shape — not just the message. This is what you'll need when a user reports a bug.

---

## Error instanceof Check

Never assume errors are `Error` instances — some network failures throw strings or objects:

```ts
// ❌ BAD — crashes if error is a string
console.error(error.message);

// ✅ GOOD
if (error instanceof Error) {
    throw error;
} else {
    throw new Error(`Network request failed: ${error}`);
}
```

---

## Catch Block Pattern

Consistent pattern across all async functions:

```ts
try {
    const response = await fetchClient.post(Endpoints.auth.login, payload);
    return response;
} catch (error) {
    console.error("Login error:", error);
    throw error; // re-throw so TanStack Query / callers handle it
}
```

Don't swallow errors silently. Either re-throw or convert to a typed error.

---

## User-Facing Errors (Flash Message)

For any error the user needs to see, use `react-native-flash-message`:

```ts
import { showMessage } from "react-native-flash-message";

// Success
showMessage({ message: "Welcome back!", type: "success" });

// Error
showMessage({ message: error?.message || "Something went wrong, please try again.", type: "danger" });

// Warning (e.g., email not confirmed)
showMessage({ message: "Please confirm your email address.", type: "warning" });

// Info
showMessage({ message: "Loading your profile...", type: "info" });
```

In the app root, mount `<FlashMessage position="top" />` once. It's a singleton.

---

## Cross-Platform Error Context

Always include `Platform.OS` in error logs — the same bug often only reproduces on one platform:

```ts
console.error("FetchClient error:", {
    url,
    platform: Platform.OS,      // "ios" | "android" | "web"
    networkMode: navigator?.onLine ? "online" : "offline",
    error: error instanceof Error ? error.message : String(error),
});
```

---

## Reactotron

Used in older RN projects for runtime inspection:

```ts
// ReactotronConfig.js (at repo root)
import Reactotron from "reactotron-react-native";

if (__DEV__) {
    Reactotron.configure()
        .useReactNative()
        .connect();

    console.tron = Reactotron; // optional shortcut
}
```

Import in the root entry before anything else:
```ts
// index.js or app/_layout.tsx
if (__DEV__) {
    require("../ReactotronConfig");
}
```

Reactotron gives: network request logging, AsyncStorage inspector, Redux/Zustand logging, custom commands for clearing storage.

---

## TanStack Query Error States

Always handle both `isPending` and `isError` in components:

```tsx
const { data, isPending, isError, error } = useMyFeatureList();

if (isPending) return <ActivityIndicator />;
if (isError) return <Text>Error: {error.message}</Text>;
```

Error messages surface directly from `FetchClient` — they'll have the API's `message` field if available.

---

## Common Silent Failure Patterns

These bite production and aren't obvious:

| Issue | Symptom | Fix |
|-------|---------|-----|
| AsyncStorage parse failure | `null` where data is expected | Wrap JSON.parse in try/catch |
| 401 mid-session | Infinite loading or blank screen | Check token refresh is wired in FetchClient |
| Multiple 401s triggering multiple refreshes | Token race condition | Use refresh queue (Axios pattern) or `isRefreshing` flag |
| Android JSON parse error on text response | Crash in `response.json()` | Check `content-type` header before calling `.json()` |
| Platform navigation crash | Works on iOS, crashes on Android | Check `router.replace` vs `router.push` usage |
| env var `undefined` | App works locally, breaks in EAS | Add var to `turbo.json` `globalEnv` + EAS env |

---

## Iron Law — Root Cause First

Never propose a fix without completing root cause investigation. Symptom fixes are failure.

> **"NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST."**

Treat this as the floor of every debugging session. A fast wrong fix costs more than a slow right one.

---

## Attempt Counter — Architecture Checkpoint

Track fix attempts explicitly. If the fix isn't working, don't reach for Fix #4.

```
Attempt 1 → small targeted change, verify result
Attempt 2 → new hypothesis, different angle, verify result
Attempt 3 → re-read root cause evidence, one more attempt
After 3 failures → STOP. Question the architecture.
```

**After 3 failed attempts:**

- Step back from the symptom entirely
- Ask: *is the architecture itself the problem?*
- Look for a structural mismatch — wrong layer, wrong abstraction, wrong mental model
- Don't attempt Fix #4 until the architectural question is answered

**Why:** Three failed fixes in a row almost always means the root cause diagnosis was wrong, not that the fix was bad. Continuing to fix is compounding the error.

**Red flags that trigger an early checkpoint (regardless of attempt count):**
- The fix makes sense but the behavior doesn't change
- Each fix breaks something different
- The bug disappears and reappears unpredictably
- "Quick fix for now, investigate later" thinking creeps in

---

## Expo Dev Client

Use dev client for debugging native modules — not Expo Go:

```sh
eas build --profile development --platform ios
# or
eas build --profile development --platform android --local
```

Dev client includes all installed native modules and can be pointed at any dev server.
