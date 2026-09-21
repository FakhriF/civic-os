# ADR-029: Driver Identity & Transportation Domain Modeling

> **Status**: Accepted
> **Date**: 2026-09-21
> **Deciders**: CivicOS Architecture Team

---

## 📌 Context & Problem Statement

v1.1 (Transportation & Municipal Transit) introduces drivers who are assigned to vehicles and routes ([`specs/transportation/`](../../specs/transportation/)). CivicOS already has a `users` table that carries authentication and RBAC data (`email`, `passwordHash`, `roleId`, `departmentId`, `isActive`). The design must decide whether a driver **is** a user account (e.g. an `Officer`) or a **separate entity**, and how the new transit resources are organized in the backend.

Two forces conflict:

- Reusing `users` avoids a new table and a join.
- Drivers are operational data (license, contact, availability) that exists independently of login access, and not every driver needs a system account.

---

## 🎯 Decision Drivers

- **Separation of concerns**: `users` is the authentication/security aggregate; driver data is operational, not identity.
- **Modeling honesty**: a driver can exist without ever signing in, and can be linked to an account when one exists.
- **Consistency**: follow ADR-013 (feature-based backend modules) and ADR-020 (no hard deletes).
- **Least privilege**: no requirement to grant transit drivers login access just to roster them.
- **Portfolio/teaching value**: demonstrate domain modeling beyond the auth aggregate, and a real overlap-integrity constraint.

---

## 🔍 Considered Options

1. **Reuse `users`** — a driver is a user with an Officer role. No new table; assign `users.id` directly.
2. **Dedicated `drivers` table with an optional `userId` link** — driver profiles live on their own, optionally pointing at a user account.
3. **Full HR module** — licensing, payroll, contracts, availability calendars.

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — dedicated `drivers` table with an optional `userId` link.**

```ts
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  licenseNumber: varchar("license_number", { length: 50 }).notNull().unique(),
  phone: varchar("phone", { length: 30 }),
  userId: integer("user_id")
    .references(() => users.id)
    .unique(),
  status: driverStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

### Consequences & Rules

1. **Identity vs. operation**: `users` holds login and RBAC; `drivers` holds operational driver data. An assignment references `drivers.id`, never `users.id`.
2. **Link is optional and unique**: `drivers.userId` is nullable and `UNIQUE`; a driver may exist without an account, and one account links to at most one driver.
3. **No hard delete**: drivers are deactivated via `status = "inactive"` (ADR-020).
4. **One transportation module**: routes, stops, vehicles, drivers, assignments, and schedules live under a single `apps/api/src/modules/transportation/` domain module (ADR-013), grouped by resource.
5. **Overlap integrity**: conflicting driver/vehicle assignments are prevented by a range-overlap check enforced in the service and covered by API tests; the one-active-schedule-per-route rule is backed by a partial unique index.

### Consequences & Trade-offs

- **Pros**:
  - Clean separation; no authentication fields polluted with operational data.
  - Drivers without accounts are first-class; accounts can be attached later.
  - The optional unique `userId` prevents double-linking the same account.
- **Cons & Trade-offs**:
  - Assignments and roster views require one extra join.
  - A person could exist both as a user and as a driver without a link; acceptable, and the unique `userId` bounds the duplication.
  - Option 3 (HR) remains out of scope for v1.1.

---

## 📎 References

- [**ADR-006** Foreign Key Normalization](./ADR-006-foreign-keys.md) · [**ADR-013** Feature-Based Backend Modules](./ADR-013-feature-based-backend-modules.md) · [**ADR-020** Soft Delete](./ADR-020-soft-delete-user-accounts.md) · [**ADR-024** Role-Based Access Control](./ADR-024-role-based-access-control.md)
- Specification: [`specs/transportation/requirements.md`](../../specs/transportation/requirements.md)
- Implementation (planned): `apps/api/src/modules/transportation/`, `apps/api/src/database/schema/driver.ts`
