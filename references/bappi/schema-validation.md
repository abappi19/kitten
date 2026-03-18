---
title: Bappi's Schema & Validation Patterns
description: Zod schema conventions — per-feature schema files, z.infer for type derivation, cross-field refinements, response interfaces vs form schemas, and React Hook Form integration.
type: reference
---

# Bappi's Schema & Validation Patterns

## Core Rule

**Types come from schemas — never manually duplicated.** Every form payload is a Zod schema first. Types are derived with `z.infer<>`. API response types are interfaces (not Zod — they're trusted server output).

---

## Schema File Structure

Each feature has a `[feature].schema.ts` that owns all Zod schemas AND all derived types AND all response interfaces:

```ts
import { z } from "zod";

// ─── Validators ────────────────────────────────────────────────────────────
const isStrongPassword = (password: string) =>
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);

const passwordMessage =
    "Password must be at least 8 characters with uppercase, lowercase, and number.";

// ─── Schemas ───────────────────────────────────────────────────────────────
export const loginPayloadSchema = z.object({
    email: z.email().trim().refine(email => !!email, { message: "Please enter a valid email" }),
    password: z.string().min(1, { message: "Password is required" }),
});

export const registerPayloadSchema = z.object({
    email: z.email().trim(),
    password: z.string().trim().refine(isStrongPassword, { message: passwordMessage }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    country: z.string().optional(),
    dob: z.string().optional(),
});

// ─── Types derived from schemas ────────────────────────────────────────────
export type LoginPayload = z.infer<typeof loginPayloadSchema>;
export type RegisterPayload = z.infer<typeof registerPayloadSchema>;

// ─── Response interfaces (API output — trusted, not validated client-side) ─
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    provider: string | null;
}

export interface Auth {
    jwt: string;
    refreshToken: string;
    expiresIn: number;
    expiresAt: number;
}

export interface LoginResponse {
    user: User;
    auth: Auth;
}

export interface RegisterResponse extends LoginResponse {}
export interface RefreshTokenResponse extends LoginResponse {}
```

---

## Cross-Field Refinement

For confirming password or any multi-field dependency:

```ts
export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, { message: "Current password is required" }),
        newPassword: z.string().trim().refine(isStrongPassword, { message: passwordMessage }),
        confirmPassword: z.string().trim().min(1, { message: "Please confirm your new password" }),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],  // error attached to the confirmPassword field
    });
```

---

## Optional Object Validation

Form fields that may or may not be present:

```ts
export const updateProfileSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    country: z.string().optional(),
    dob: z.string().optional(),
});
```

---

## Array Validation

```ts
export const userPreferencesSchema = z.object({
    sports: z.array(z.string()).optional(),
});
```

---

## OTP / Short Code

```ts
export const otpSchema = z.object({
    otp: z.string().min(6, { message: "OTP must be 6 digits" }),
    email: z.string().email({ message: "Please enter a valid email" }),
});
```

---

## React Hook Form Integration

Zod schema connects to `react-hook-form` via `@hookform/resolvers/zod`:

```ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginPayloadSchema, type LoginPayload } from "@/lib/services/auth/auth.schema";

const form = useForm<LoginPayload>({
    resolver: zodResolver(loginPayloadSchema),
    defaultValues: {
        email: "",
        password: "",
    },
});

const { handleSubmit, formState: { errors, isSubmitting } } = form;
```

The `LoginPayload` type comes from `z.infer<>` — no duplication.

---

## Response Interfaces (vs Zod Schemas)

Zod schemas are for **input validation** (form data the user submits). API responses are **trusted** — they're validated by the server. So response types are plain TypeScript interfaces, not Zod schemas.

```ts
// ✅ Zod — user input (validate on the client)
export const loginPayloadSchema = z.object({ ... });
export type LoginPayload = z.infer<typeof loginPayloadSchema>;

// ✅ Interface — API response (trusted, not re-validated)
export interface LoginResponse {
    user: User;
    auth: Auth;
}
```

Extending interfaces for response variants:

```ts
export interface RegisterResponse extends LoginResponse {}
export interface ConfirmEmailResponse extends LoginResponse {}
```

---

## BAD vs GOOD

```ts
// ❌ BAD — manual type duplication
interface LoginPayload {
    email: string;
    password: string;
}
const loginSchema = z.object({ email: z.string(), password: z.string() });

// ✅ GOOD — single source of truth
export const loginPayloadSchema = z.object({ email: z.string(), password: z.string() });
export type LoginPayload = z.infer<typeof loginPayloadSchema>;
```

```ts
// ❌ BAD — validation message as raw string, no context
password: z.string().min(8)

// ✅ GOOD — meaningful message
password: z.string().refine(isStrongPassword, { message: passwordMessage })
```

```ts
// ❌ BAD — schema.ts only has schemas, types live elsewhere
// lib/types/auth.types.ts — separate file

// ✅ GOOD — all auth contracts in one file
// lib/services/auth/auth.schema.ts — schemas + types + response interfaces
```
