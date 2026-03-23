# WIP: Add Clean Architecture / Hexagonal / DDD to architecture.md
status: in-progress

## Goal

Append three new sections to `references/architecture/architecture.md`:
- Clean Architecture (adapted to TypeScript / Hono.js)
- Hexagonal Architecture — Ports and Adapters (TypeScript)
- DDD Tactical Patterns (TypeScript)

Source: https://skills.sh/wshobson/agents/architecture-patterns
All Python examples rewritten for Bappi's actual stack (TypeScript, Hono, Zod, RN).

---

## File to Change

`references/architecture/architecture.md`

---

## New Content to Append

```markdown
---

## 8. Clean Architecture

Bappi uses Clean Architecture for backend services — primarily Hono.js APIs and
NestJS microservices. The rule is simple: dependencies point inward. Outer layers
know about inner ones, never the reverse.

**Layers (dependency flows inward):**
- **Entities** — core business models, no framework imports
- **Use Cases** — application business rules, orchestrate entities
- **Interface Adapters** — controllers, service wrappers, DTOs
- **Infrastructure** — Hono routes, database, external APIs, storage

**Directory structure (Hono.js service):**
```
src/
├── domain/
│   ├── entities/          # Pure TS types/classes — no imports from outside domain/
│   │   ├── user.entity.ts
│   │   └── order.entity.ts
│   ├── value-objects/     # Immutable, validated types (Email, Money)
│   │   └── email.ts
│   └── interfaces/        # Abstract contracts — what adapters must implement
│       ├── user.repository.ts
│       └── payment-gateway.ts
│
├── use-cases/             # Business logic — depends only on domain/
│   ├── create-user.ts
│   └── process-order.ts
│
├── adapters/              # Implements domain/interfaces/ — depends on use-cases + domain
│   ├── repositories/
│   │   └── postgres-user.repository.ts
│   ├── gateways/
│   │   └── stripe-payment.gateway.ts
│   └── controllers/       # Hono route handlers — HTTP concerns only
│       └── user.controller.ts
│
└── infrastructure/        # Framework wiring — Hono app, DB pool, env config
    ├── app.ts
    ├── db.ts
    └── container.ts       # Dependency injection
```

**Entity — no framework imports:**
```typescript
// domain/entities/user.entity.ts
export type UserId = string & { readonly _brand: 'UserId' };

export interface User {
  id: UserId;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

export function canPlaceOrder(user: User): boolean {
  return user.isActive;
}
```

**Interface (port):**
```typescript
// domain/interfaces/user.repository.ts
import type { User, UserId } from '../entities/user.entity';

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}
```

**Use case — depends only on domain:**
```typescript
// use-cases/create-user.ts
import { randomUUID } from 'crypto';
import type { UserRepository } from '../domain/interfaces/user.repository';
import type { User, UserId } from '../domain/entities/user.entity';

export async function createUser(
  repo: UserRepository,
  input: { email: string; name: string }
): Promise<{ user: User } | { error: string }> {
  const existing = await repo.findByEmail(input.email);
  if (existing) return { error: 'Email already exists' };

  const user: User = {
    id: randomUUID() as UserId,
    email: input.email,
    name: input.name,
    isActive: true,
    createdAt: new Date(),
  };

  return { user: await repo.save(user) };
}
```

**Controller — HTTP concerns only:**
```typescript
// adapters/controllers/user.controller.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createUser } from '../../use-cases/create-user';
import type { UserRepository } from '../../domain/interfaces/user.repository';

const createUserSchema = z.object({ email: z.string().email(), name: z.string().min(1) });

export function userRoutes(repo: UserRepository) {
  const app = new Hono();

  app.post('/', zValidator('json', createUserSchema), async (c) => {
    const result = await createUser(repo, c.req.valid('json'));
    if ('error' in result) return c.json({ error: result.error }, 400);
    return c.json({ user: result.user }, 201);
  });

  return app;
}
```

**Rule Bappi enforces:** use cases never import from `adapters/` or `infrastructure/`.
Controllers never contain business logic — they parse input, call a use case, return a response.

---

## 9. Hexagonal Architecture — Ports and Adapters

Hexagonal is a more explicit form of the same idea: define *ports* (interfaces) for every
external dependency, then swap *adapters* (implementations) without touching the core.
This is how Bappi makes services testable without hitting a real DB or Stripe.

**Core structure:**
```
Domain Core (business logic)
      ↕ Ports (interfaces)
      ↕
Adapters (concrete implementations: DB, Stripe, email, mock)
```

**Port definitions:**
```typescript
// domain/ports/payment.port.ts
export interface PaymentPort {
  charge(input: { amountCents: number; currency: string; customerId: string }): Promise<
    { success: true; transactionId: string } | { success: false; error: string }
  >;
}

// domain/ports/notification.port.ts
export interface NotificationPort {
  send(input: { to: string; subject: string; body: string }): Promise<void>;
}
```

**Real adapter (Stripe):**
```typescript
// adapters/stripe-payment.adapter.ts
import Stripe from 'stripe';
import type { PaymentPort } from '../domain/ports/payment.port';

export class StripePaymentAdapter implements PaymentPort {
  constructor(private stripe: Stripe) {}

  async charge(input: { amountCents: number; currency: string; customerId: string }) {
    try {
      const charge = await this.stripe.charges.create({
        amount: input.amountCents,
        currency: input.currency,
        customer: input.customerId,
      });
      return { success: true as const, transactionId: charge.id };
    } catch (e) {
      return { success: false as const, error: (e as Error).message };
    }
  }
}
```

**Mock adapter (tests — no external calls):**
```typescript
// adapters/mock-payment.adapter.ts
import type { PaymentPort } from '../domain/ports/payment.port';

export class MockPaymentAdapter implements PaymentPort {
  async charge() {
    return { success: true as const, transactionId: 'mock-txn-123' };
  }
}
```

**Domain service — depends only on ports, not concrete adapters:**
```typescript
// domain/order.service.ts
import type { OrderRepository } from './ports/order.repository';
import type { PaymentPort } from './ports/payment.port';
import type { NotificationPort } from './ports/notification.port';

export class OrderService {
  constructor(
    private orders: OrderRepository,
    private payments: PaymentPort,
    private notifications: NotificationPort
  ) {}

  async placeOrder(order: Order): Promise<{ success: boolean; error?: string }> {
    if (!order.items.length) return { success: false, error: 'Empty order' };

    const payment = await this.payments.charge({
      amountCents: order.totalCents,
      currency: 'USD',
      customerId: order.customerId,
    });

    if (!payment.success) return { success: false, error: payment.error };

    await this.orders.save({ ...order, status: 'paid' });
    await this.notifications.send({
      to: order.customerEmail,
      subject: 'Order confirmed',
      body: `Order ${order.id} is confirmed.`,
    });

    return { success: true };
  }
}
```

**Why this matters:** swap `StripePaymentAdapter` for `MockPaymentAdapter` in tests — zero network calls, deterministic behavior. Same swap works for any new payment provider without touching `OrderService`.

---

## 10. DDD Tactical Patterns

Bappi applies DDD tactically — Value Objects and Entities most often. Full Bounded Contexts
only on large multi-domain systems.

**Value Objects — immutable, validated, structurally equal:**
```typescript
// domain/value-objects/email.ts
export class Email {
  readonly value: string;

  constructor(raw: string) {
    if (!raw.includes('@')) throw new Error(`Invalid email: ${raw}`);
    this.value = raw.toLowerCase().trim();
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// domain/value-objects/money.ts
export class Money {
  constructor(readonly amountCents: number, readonly currency: string) {
    if (amountCents < 0) throw new Error('Money cannot be negative');
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch');
    return new Money(this.amountCents + other.amountCents, this.currency);
  }

  format(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amountCents / 100);
  }
}
```

**Entity — identity-based equality, mutable state, business rules as methods:**
```typescript
// domain/entities/order.entity.ts
import type { Money } from '../value-objects/money';

export type OrderStatus = 'pending' | 'paid' | 'cancelled';

export class OrderEntity {
  private _events: DomainEvent[] = [];

  constructor(
    readonly id: string,
    private _status: OrderStatus,
    private _items: OrderItem[]
  ) {}

  get status(): OrderStatus { return this._status; }
  get items(): readonly OrderItem[] { return this._items; }
  get events(): readonly DomainEvent[] { return this._events; }

  addItem(item: OrderItem): void {
    if (this._status !== 'pending') throw new Error('Cannot modify a non-pending order');
    this._items.push(item);
    this._events.push({ type: 'ItemAdded', orderId: this.id, item });
  }

  submit(): void {
    if (!this._items.length) throw new Error('Cannot submit empty order');
    if (this._status !== 'pending') throw new Error('Order already submitted');
    this._status = 'paid';
    this._events.push({ type: 'OrderSubmitted', orderId: this.id });
  }

  total(): Money {
    return this._items.reduce(
      (acc, item) => acc.add(item.subtotal()),
      new Money(0, 'USD')
    );
  }

  clearEvents(): void { this._events = []; }
}
```

**Repository — persist and reconstitute aggregates, publish domain events:**
```typescript
// domain/ports/order.repository.ts
import type { OrderEntity } from '../entities/order.entity';

export interface OrderRepository {
  findById(id: string): Promise<OrderEntity | null>;
  save(order: OrderEntity): Promise<void>;
}

// adapters/postgres-order.repository.ts (implementation)
export class PostgresOrderRepository implements OrderRepository {
  async save(order: OrderEntity): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.query('UPDATE orders SET status = $1 WHERE id = $2', [order.status, order.id]);
      for (const event of order.events) {
        await tx.query('INSERT INTO domain_events (type, payload) VALUES ($1, $2)', [
          event.type, JSON.stringify(event),
        ]);
      }
    });
    order.clearEvents();
  }
}
```

**When Bappi uses each:**

| Pattern | When |
|---------|------|
| Value Objects | Email, Money, PhoneNumber, Address — anything validated + immutable |
| Entities | Order, User, Booking — objects with identity and lifecycle |
| Repositories | Every aggregate that needs persistence |
| Domain Events | Cross-aggregate side effects (send email after order, update stats after payment) |
| Bounded Contexts | Only on large multi-team systems with separate domain models (e.g. billing vs shipping) |
```

---

## Notes

- All examples translated from Python to TypeScript — Hono.js for backend, standard TS classes/interfaces
- Branded types used for IDs (`UserId`) — Bappi's preference over plain strings
- Zod integration shown for controller validation layer (consistent with bappi/schema-validation.md)
- Mock adapter pattern aligns with bappi/testing.md (msw for API mocking, same philosophy)

## Tasks
- [ ] Fetch current references/architecture/architecture.md (done — loaded above)
- [ ] Append sections 8, 9, 10 to the file
- [ ] Verify table of contents reflects the new sections
