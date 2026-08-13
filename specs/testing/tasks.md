# Testing — Tasks

> Implements: [./design.md](./design.md)
> Status: Complete

Every task references the requirement ID(s) it implements. The feature is only ready for verification when every requirement R1..R6 has at least one task.

## Backend Refactor (testability)

- [x] Extract app builder to `src/app.ts` (export `app`, no `.listen`); slim `src/index.ts` to import + listen (R3)
- [x] Move announcement transition validation into `AnnouncementService.assertTransition` + map error to `400 INVALID_STATUS_TRANSITION` in routes (R4)
- [x] Extract `computeTotalPages` to `src/lib/pagination.ts`; use it in announcement + population services (R4)

## Test Infrastructure

- [x] Add `postgres-test` service to `docker-compose.yml` (port 5433, db `civicos_test`) (R2)
- [x] Add `apps/api/bunfig.toml` with `[test] serial = true` (R5)
- [x] Add `src/test/setup.ts` preload: set `DATABASE_URL` → run migrations once → `resetDb()` (R2, R5)
- [x] Add `src/lib/test-helpers.ts`: `api()`, `login()`, `seedBaseline()` (R2, R3)
- [x] Add `test` scripts in `apps/api/package.json` and root `package.json` (R1)

## Unit Tests

- [x] `announcement-transition.test.ts`: full 3×3 transition matrix, no DB (R4)
- [x] `pagination.test.ts`: zero items, exact multiple, remainder, defensive limits (R4)

## API Tests

- [x] `auth.test.ts`: login ok/wrong password/unknown email/disabled, `/me` with and without token, 422 shape (R3)
- [x] `users.test.ts`: list auth, RBAC 403, create, duplicate email 409, self-deactivation 400, 404 (R3)
- [x] `population.test.ts`: pagination, search, gender filter, duplicate NIK 409, NIK immutable, 404 (R3)
- [x] `announcements.test.ts`: filters, create→draft, publish/archive/republish, invalid transition 400, 403 for Mayor, 404s (R3)

## Verification

- [x] `bun test` green (serial, against `civicos_test`)
- [x] `bunx tsc --noEmit` (api) and `bunx tsc -b` (web) green
- [x] `bun run lint` green
- [x] Manual smoke: dev flow (login → dashboard → announcements) still works after refactors
- [x] Spec reflects the final implementation
