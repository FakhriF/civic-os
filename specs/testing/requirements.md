# Testing — Requirements

> Implements M8 (Testing & Deploy) — first half
> Status: Complete

## R1 — Test Runner & Scripts

The project SHALL provide an automated test suite runnable with a single command, using the existing Bun runtime ([ADR-008](./../../docs/adr/ADR-008-bun-runtime.md), [ADR-009](./../../docs/adr/ADR-009-pure-bun-project.md)). No new test dependencies SHALL be added.

### Acceptance Criteria

- `bun test` inside `apps/api` runs the full API + unit suite.
- The root `package.json` exposes a `test` script that runs the suite from anywhere.
- A failing test exits with a non-zero code (CI-friendly).
- `bun run lint` and type checks remain green alongside the suite (see R6).

## R2 — Isolated Test Database

Tests SHALL run against a dedicated PostgreSQL database (`civicos_test`), completely separate from the development database. Tests SHALL never read from or write to the development database.

### Acceptance Criteria

- A `postgres-test` service exists in `docker-compose.yml` (separate container, separate port, separate database name).
- The schema is synchronized to the test database before the suite runs.
- Test data is seeded deterministically by the test setup itself — never by the development seed or by hand.

## R3 — API Integration Tests

The API SHALL be tested end-to-end through its HTTP layer using Elysia's in-process request handling (`app.handle()`), without opening a network port. Coverage SHALL include: authentication, user management, population registry, and announcements.

### Acceptance Criteria

- **Auth**: valid login returns a token; invalid password is rejected; unknown email is rejected without revealing existence; `/me` requires a valid token; disabled accounts are rejected.
- **Users**: directory is readable by any authenticated user; mutations require `Administrator` (403 otherwise); duplicate email → `409 EMAIL_EXISTS`; self-deactivation → `400 SELF_DEACTIVATION`; unknown id → `404 USER_NOT_FOUND`.
- **Population**: paginated list + search + gender filter; duplicate NIK → `409 CITIZEN_EXISTS`; immutable NIK on update; unknown id → `404 CITIZEN_NOT_FOUND`.
- **Announcements**: create lands as `draft`; publish/archive transitions are validated (invalid → `400 INVALID_STATUS_TRANSITION`); mutations require Officer+ (403 for `Mayor`); unknown id → `404 ANNOUNCEMENT_NOT_FOUND`.
- Unauthenticated requests return `401 UNAUTHORIZED` for every protected route.
- Malformed bodies return `422 VALIDATION` (existing global handler).

## R4 — Unit Tests for Pure Logic

Pure business logic SHALL be extracted from route handlers and unit-tested without a database.

### Acceptance Criteria

- **Announcement status transitions**: a pure `assertTransition(current, next)` covers the full matrix — `draft→published` ok, `published→archived` ok, `archived→published` ok, and every invalid pair rejects (e.g. `draft→archived`, `published→published`, `archived→archived`).
- **Pagination math**: a pure `computeTotalPages(total, limit)` covers zero items, exact multiples, remainders, and defensive `limit` handling.

## R5 — Determinism & Isolation

The suite SHALL be deterministic: running it twice produces identical results, no test depends on another test, and no test depends on data left behind by a previous run.

### Acceptance Criteria

- Test files run serially (shared database — no parallel-file races).
- The database is reset to a known baseline before each suite.
- Each test creates and cleans up only its own data.

## R6 — Verification

A feature in M8 is complete only when the new suite passes AND the existing checks still pass.

### Acceptance Criteria

- `bun test` (API suite) — green.
- `bunx tsc --noEmit` (API) and `bunx tsc -b` (web) — green.
- `bun run lint` — green.
- Manual smoke: `docker compose up` dev flow (login → dashboard → announcements) still works.
