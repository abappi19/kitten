---
title: Bappi's Hono Patterns
description: Hono as the preferred lightweight backend — app setup, route handlers, middleware (auth, CORS, logger), Zod validation with zValidator, router splitting, Cloudflare Workers deployment, and when to use Hono vs NestJS vs Next.js API routes.
type: reference
---

# Bappi's Hono Patterns

## When to Use Hono

| Backend need | Use |
|---|---|
| Lightweight REST API, edge deployment, Cloudflare Workers | **Hono** (preferred) |
| Complex microservices, RabbitMQ, heavy infra integrations | NestJS |
| Minimal server-side logic co-located with a Next.js web app | Next.js API routes |
| Traditional Node.js server, existing team familiarity | Express |

Hono is the default choice for new backend projects. It runs anywhere — Cloudflare Workers, Node.js, Bun, Deno — and has near-zero overhead.

---

## Basic App Setup (Bun)

```ts
import { Hono } from "hono";

const app = new Hono();

app.get("/", c => c.json({ message: "ok" }));

export default app;
```

Run:
```bash
bun run src/index.ts
```

---

## Route Handlers

```ts
const app = new Hono();

// GET with param
app.get("/users/:id", async c => {
    const id = c.req.param("id");
    const user = await getUser(id);
    return c.json(user);
});

// POST with body
app.post("/users", async c => {
    const body = await c.req.json<CreateUserPayload>();
    const user = await createUser(body);
    return c.json(user, 201);
});

// DELETE
app.delete("/users/:id", async c => {
    const id = c.req.param("id");
    await deleteUser(id);
    return c.body(null, 204);
});
```

---

## Middleware

### Logger + CORS

```ts
import { logger } from "hono/logger";
import { cors } from "hono/cors";

app.use("*", logger());
app.use("*", cors({
    origin: process.env.WEB_ORIGIN || "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
}));
```

### Auth Middleware

```ts
import { createMiddleware } from "hono/factory";

export const requireAuth = createMiddleware(async (c, next) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    const payload = await verifyToken(token);
    if (!payload) {
        return c.json({ error: "Invalid token" }, 401);
    }
    c.set("user", payload);
    await next();
});

// Apply to a route
app.get("/profile", requireAuth, async c => {
    const user = c.get("user");
    return c.json({ userId: user.id });
});
```

---

## Zod Validation (zValidator)

```ts
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const createUserSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});

app.post(
    "/users",
    zValidator("json", createUserSchema),
    async c => {
        const body = c.req.valid("json"); // typed, already validated
        const user = await createUser(body);
        return c.json(user, 201);
    }
);
```

Validation errors return `400` automatically with the Zod error message — no manual error handling needed.

---

## Router Splitting

```ts
// routes/users.ts
import { Hono } from "hono";

const users = new Hono();

users.get("/", async c => { /* list */ });
users.post("/", zValidator("json", createUserSchema), async c => { /* create */ });
users.get("/:id", async c => { /* detail */ });
users.delete("/:id", async c => { /* delete */ });

export default users;

// index.ts
import users from "./routes/users";
app.route("/users", users);
```

---

## Error Handling

```ts
app.onError((err, c) => {
    console.error(err);
    return c.json({ error: err.message || "Internal server error" }, 500);
});

app.notFound(c => c.json({ error: "Not found" }, 404));
```

---

## Environment Variables

**Bun / Node.js:** standard `process.env`:

```ts
const secret = process.env.SECRET_API_KEY;
```

**Cloudflare Workers:** env comes from `c.env` (bound in `wrangler.toml`):

```ts
app.get("/", async c => {
    const secret = c.env.SECRET_API_KEY;
    const db = c.env.DB; // D1, KV, R2, etc.
    return c.json({ ok: true });
});
```

TypeScript bindings:

```ts
type Bindings = {
    SECRET_API_KEY: string;
    DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();
```

---

## Cloudflare Workers Deployment

```ts
// src/index.ts
import { Hono } from "hono";

type Bindings = { DB: D1Database };

const app = new Hono<{ Bindings: Bindings }>();

app.get("/users", async c => {
    const { results } = await c.env.DB.prepare("SELECT * FROM users").all();
    return c.json(results);
});

export default app;
```

`wrangler.toml`:
```toml
name = "my-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "..."
```

Deploy:
```bash
wrangler deploy
```

---

## BAD vs GOOD

```ts
// ❌ BAD — business logic and validation inline in handler
app.post("/users", async c => {
    const body = await c.req.json();
    if (!body.email || !body.email.includes("@")) {
        return c.json({ error: "Invalid email" }, 400);
    }
    const user = await db.insert(body);
    return c.json(user);
});

// ✅ GOOD — Zod validation middleware + service layer
app.post(
    "/users",
    zValidator("json", createUserSchema),
    async c => {
        const body = c.req.valid("json");
        const user = await userService.create(body);
        return c.json(user, 201);
    }
);
```

```ts
// ❌ BAD — all routes in one file
app.get("/users", ...)
app.post("/users", ...)
app.get("/products", ...)
app.post("/products", ...)

// ✅ GOOD — route-per-domain split, mounted at root
app.route("/users", usersRouter);
app.route("/products", productsRouter);
```
