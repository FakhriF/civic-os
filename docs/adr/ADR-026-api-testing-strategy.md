# ADR-026: API Testing Strategy

> **Status**: Accepted  
> **Date**: 2026-08-13  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

Milestones M1–M7 shipped without any automated tests — every module spec deferred them with "automated tests pending" until M8. By M8 the API covers authentication, users, population, and announcements with substantial business rules (RBAC, status transitions, uniqueness, pagination), and there was still no runner, no test database, and no convention for how to test an Elysia app. M8 needed a testing strategy that every future module can plug into.

---

## 🎯 Decision Drivers

- **Pure Bun** ([ADR-008](./ADR-008-bun-runtime.md), [ADR-009](./ADR-009-pure-bun-project.md)): use `bun test`; no new test dependencies.
- **Real database, not mocks**: all business logic lives in Drizzle queries — mocking would test nothing meaningful.
- **Isolation**: tests must never touch the development database or its data.
- **Determinism**: same suite run twice → same result; no cross-file interference.
- **Layered architecture** ([ADR-004](./ADR-004-layered-architecture.md)): pure business rules are extracted to services/lib so they can be unit-tested without a database.

---

## 🔍 Considered Options

1. **`bun test` + isolated Postgres container + in-process `app.handle()`** — zero new dependencies, end-to-end through the real HTTP layer, isolated DB.
2. **Vitest/Jest + mocking** — mature tooling, but violates the pure-Bun decision and mocks away the query layer.
3. **Testcontainers / ephemeral DB per run** — heavier machinery than needed; a fixed compose service is simpler for a dev-only suite.
4. **Reuse the development database** — fastest, but tests would pollute dev data and depend on its current state.

---

## ✅ Decision Outcome

**Chosen Option**: **Option 1 — `bun test` + isolated test database + in-process HTTP**.

### Architecture

- **App refactor**: the app builder moved from `src/index.ts` to `src/app.ts` (exported, no `.listen()`); `src/index.ts` only binds the port. Tests drive the app in-process via Elysia's `app.handle(new Request(...))` — no port, no supertest-style dependency.
- **Test database**: `postgres-test` service in `docker-compose.yml` ([ADR-019](./ADR-019-incremental-docker-compose.md)) — port `5433`, database `civicos_test`, credentials fixed to `civicos`/`civicos_test` (test-only, not secrets). The preload file (`src/test/setup.ts`) sets `DATABASE_URL` before any module imports `database/client.ts`; dotenv's default `override: false` guarantees the test URL wins over `.env.local`.
- **Schema**: applied in-process with `drizzle-orm/node-postgres/migrator` over the project's own migration folder — no `bunx` spawn, always the real schema.
- **Serial execution**: `apps/api/bunfig.toml` → `[test] serial = true`. All files share one database; parallel files would race on resets.
- **Baseline data**: `resetDb()` truncates (`users`, `citizens`, `announcements`) and re-seeds deterministic roles, departments, and five users (admin/manager/officer/mayor/inactive, password `TestPass123!`). Tests never depend on dev seed data.
- **Helpers**: `src/lib/test-helpers.ts` exposes `api()` (request wrapper), `login()` (end-to-end login, fails fast), `resetDb()`, `seedBaseline()`, `roleIdByName()`/`departmentIdByName()` (no hardcoded ids, per [ADR-024](./ADR-024-role-based-access-control.md)).
- **Layout**: tests in `src/test/unit/*.test.ts` and `src/test/api/*.test.ts`; helpers deliberately live in `src/lib/` so the runner never executes them as tests.

### Consequences & Rules:

1. **Every module adds `*.test.ts` suites** alongside its implementation; API tests cover happy paths AND error contracts (401/403/404/409/422/400).
2. **Pure logic goes to services/lib** (`assertTransition`, `computeTotalPages`) and gets a unit test with no database — this is the [ADR-004](./ADR-004-layered-architecture.md) testability payoff.
3. **`bun test` requires `docker compose up -d postgres-test`** first; the suite fails with a clear connection error otherwise.
4. **Tests run serially and reset state per file** — never depend on data from a previous test or a previous run.
5. **Frontend component tests are out of scope** for now (deferred to backlog).

### Consequences & Trade-offs:

- **Pros**:
  - 46 tests (11 unit + 35 API) green at M8 close, covering every module's core contract.
  - No new dependencies; pure Bun preserved.
  - Tests caught real regressions during the M8 refactors (transition validation move, app extraction).
- **Cons & Trade-offs**:
  - API tests need the extra `postgres-test` container running (documented; one command).
  - In-process `app.handle()` does not exercise a real TCP listener (acceptable — the HTTP layer, middleware, and DB are all real).

---

## 📎 References

- [**ADR-008** Bun Runtime](./ADR-008-bun-runtime.md) · [**ADR-009** Pure Bun Project](./ADR-009-pure-bun-project.md) · [**ADR-004** Layered Architecture](./ADR-004-layered-architecture.md) · [**ADR-019** Incremental Docker Compose](./ADR-019-incremental-docker-compose.md)
- Specification: [`specs/testing/`](../../specs/testing/)
- Implementation: `apps/api/src/app.ts` · `apps/api/src/test/` · `apps/api/src/lib/test-helpers.ts` · `docker-compose.yml`
