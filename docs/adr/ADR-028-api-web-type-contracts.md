# ADR-028: API–Web Type Contract Strategy

> **Status**: Accepted  
> **Date**: 2026-08-14  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

ADR-001, ADR-003, ADR-004, and `docs/project-structure.md` were written assuming a `packages/shared` workspace package (`@civicos/shared`) that would hold shared domain types and **Zod** validation schemas, imported by both `apps/web` and `apps/api`.

That package was never built. `packages/` contained only empty folders and was removed in commit `15ef749` (*"drop empty workspaces folders"*), and the Bun workspace declares only `["apps/*"]` — confirmed by `bun.lock`, which contains workspace entries for `apps/api` and `apps/web` exclusively. Two further facts contradict the documented premise:

1. **There is no Zod anywhere in the codebase.** Request validation is implemented with Elysia's `t` (TypeBox) schemas, e.g. `CreateAnnouncementBody` in `apps/api/src/modules/announcement/announcement.routes.ts`.
2. **Response shapes are mirrored by hand.** The web app declares local `interface`s per feature — `Announcement` in `apps/web/src/features/announcement/use-announcements.ts`, `User` in `apps/web/src/features/authentication/auth-context.tsx` — and asserts the API payload onto them (`res.data.data as AnnouncementListResult`).

The result is documentation that describes a structure which does not exist, and no mechanism that keeps the mirrored web types in step with the API.

---

## 🎯 Decision Drivers

- **Documentation describes reality**: `docs/` is the project's source of truth and must not promise structure that is not there.
- **No premature abstraction**: the shared surface is still small (Announcement, Citizen, User); a workspace package for a handful of interfaces adds cost before it adds value.
- **Avoid package tooling cost**: a shared package requires an `exports` map resolved by both Bun and Vite, plus boundary discipline to avoid the circular dependencies ADR-001 already warns about.
- **Keep a credible upgrade path**: end-to-end type safety is genuinely desirable as domains multiply (v1.1+), so the decision must name the path rather than close the door.

---

## 🔍 Considered Options

1. **Reintroduce `packages/shared`** — a types-only workspace package imported by both apps.
2. **Mirrored contract types, documented** — `apps/api` is the source of truth; the web app mirrors response shapes locally. (Chosen.)
3. **Eden Treaty (`@elysiajs/eden`)** — infer the client types directly from the Elysia `App` type.

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — mirrored contract types**, with Option 3 recorded as the deferred upgrade path.

### Rules:

1. **`apps/api` is the source of truth** for the wire contract. A response shape is defined by the API's select objects and service return values (e.g. `announcementSelect` in `announcement.service.ts`).
2. **The web app mirrors those shapes as local interfaces** inside the owning feature (`use-*.ts`). No `@civicos/shared`, no `packages/` workspace.
3. **No Zod.** Request validation lives in the API via Elysia `t` schemas. Frontend validation is UX-only and never a security boundary.
4. **Contract changes are atomic.** A change to an API response shape and the matching web interface land in the same commit — the existing monorepo atomic-commit property (ADR-001) is what contains drift.
5. **Integration tests are the safety net.** API tests (ADR-026) assert the real response contract. TypeScript alone does **not** verify the web's mirrored types, because the payload is narrowed with a type assertion rather than parsed.
6. **Reopen this ADR if logic — not just types — must be shared.** At that point prefer Option 3 (Eden Treaty) over a shared package, since it delivers inference without a second workspace to maintain.

### Consequences & Trade-offs:

- **Pros**:
  - Documentation matches the codebase; no aspirational structure to mislead contributors.
  - Zero added tooling — no exports mapping, no dual Bun/Vite resolution, no new failure mode.
  - Drift is contained by atomic commits plus API contract tests, which is proportionate to the current domain count.
- **Cons & Trade-offs**:
  - Web-side type safety at the API boundary is *declarative*, not verified: `as Announcement` trusts the declared shape without checking the actual payload. A renamed API field is caught by tests and review, not by the compiler.
  - As domains multiply the mirrored types grow linearly; this decision is expected to be revisited at v1.1+.

### Deferred — Eden Treaty:

- `apps/api/src/app.ts` already exports the `app` instance, so the type side is ready.
- The real cost is the client: adopting Eden Treaty means replacing the `axios` client in `apps/web/src/services/api-client.ts`, including its queueing 401 → refresh-and-retry interceptor (ADR-022), which is the riskiest part of the migration.

---

## 📎 References

- [**ADR-001** Monorepo Architecture](./ADR-001-monorepo.md) · [**ADR-003** REST API Architecture](./ADR-003-rest-api.md) · [**ADR-004** Layered Architecture](./ADR-004-layered-architecture.md) · [**ADR-013** Feature-Based Backend Modules](./ADR-013-feature-based-backend-modules.md) · [**ADR-022** JWT Session Management](./ADR-022-jwt-session-management.md) · [**ADR-026** API Testing Strategy](./ADR-026-api-testing-strategy.md)
- Documentation: [`docs/project-structure.md`](../project-structure.md) · [`docs/architecture.md`](../architecture.md) · [`docs/development-standards.md`](../development-standards.md)
- Implementation: `apps/api/src/modules/announcement/announcement.service.ts` · `apps/web/src/features/announcement/use-announcements.ts`
