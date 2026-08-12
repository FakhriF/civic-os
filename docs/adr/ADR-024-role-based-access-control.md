# ADR-024: Role-Based Access Control

> **Status**: Accepted  
> **Date**: 2026-08-11  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

CivicOS defines four roles — `Administrator`, `Manager`, `Mayor`, `Officer` — seeded into the `roles` table, and the JWT access token carries the user's `roleId` ([**ADR-022**](./ADR-022-jwt-session-management.md)). However, authorization checks were not implemented at all: ADR-022 noted the role was "carried in the token for future use". User Management (M5) is the first feature with admin-only mutations, so CivicOS needs a server-side authorization pattern that every future module can reuse.

---

## 🎯 Decision Drivers

- **Server-Side Enforcement**: Authorization MUST be enforced on the API, never only hidden in the UI.
- **Reusability**: One guard pattern that modules (population, announcements, finance) can apply per-role.
- **No Hardcoded Role IDs**: Roles are compared by name looked up from the DB, keeping the seed data the single source of truth.
- **Correct Hook Scoping**: The guard must actually run for the protected routes — a subtle Elysia scoping trap.

---

## 🔍 Considered Options

1. **In-Handler Checks** (`if (user.roleId !== SOME_ID) return 403`) — duplicated in every handler, hardcodes role ids.
2. **Reusable `requireRole` Guard Plugin** — a small Elysia plugin with a scoped `onBeforeHandle`, applied via `.use()`.
3. **Permission Matrix** (roles → permissions map, e.g. `users:write`) — most flexible, but premature for the current role set.

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Reusable `requireRole` guard plugin**.

```ts
const requireRole = (roleName: string) =>
  new Elysia({ name: "require-role" })
    .use(databasePlugin)
    .use(authMiddleware)
    // as: "scoped" matters — the default 'local' hook scope would only
    // apply to routes inside this plugin, which has none; scoped reaches
    // the parent's routes registered after .use(requireRole(...))
    .onBeforeHandle({ as: "scoped" }, async ({ db, user, set }) => {
      const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.name, roleName))
        .limit(1);

      if (!user || !role || user.roleId !== role.id) {
        set.status = 403;
        return {
          status: "error",
          error: { code: "FORBIDDEN", message: "Forbidden." },
        };
      }
    });
```

Applied to mutation routes only: `.use(requireRole("Administrator"))` after the shared `.use(authMiddleware)`.

### Consequences & Rules:

1. **Enforcement is server-side only** — hiding buttons in the UI is UX polish, never the security boundary.
2. **Role by name, not id**: the role is looked up from the `roles` table each request; the token's `roleId` is compared against it.
3. **Hook scope**: the guard's `onBeforeHandle` MUST be `as: "scoped"`; the default `local` scope silently disables the guard (routes pass through unguarded) — verified empirically during M5.
4. **Role changes lag by token lifetime**: the token carries the old `roleId` until it expires (15 minutes), so role changes take effect on the next access token.
5. **Current policy**: user-management mutations (create/update/deactivate) are `Administrator`-only; the directory is readable by any authenticated user. Future modules define their own role requirements.
6. **Deferred**: the permission matrix (Option 3) may replace per-route guards when the module set and role distinctions grow.

### Consequences & Trade-offs:

- **Pros**:
  - One reusable pattern; new modules add a one-line guard.
  - No duplicated authorization logic or hardcoded role ids.
  - Fails closed: `!user` or unknown role → `403`.
- **Cons & Trade-offs**:
  - A DB round-trip per guarded request to resolve the role by name (negligible at CivicOS scale).
  - Coarse-grained (whole route vs. individual resource permissions); the matrix can be introduced later.

---

## 📎 References

- [**ADR-022** JWT Session Management](./ADR-022-jwt-session-management.md) · [**ADR-020** Soft Delete](./ADR-020-soft-delete-user-accounts.md)
- Specification: [`specs/user-management/`](../../specs/user-management/)
- Implementation: `apps/api/src/modules/user/user.routes.ts` (`requireRole`), `apps/api/src/modules/user/user.service.ts`
