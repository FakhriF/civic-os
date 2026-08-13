# Testing — Design

> Implements: [./requirements.md](./requirements.md)
> Status: Draft

---

## 1. Test Runner

Use `bun test` ([ADR-008](./../../docs/adr/ADR-008-bun-runtime.md), [ADR-009](./../../docs/adr/ADR-009-pure-bun-project.md)) — zero new dependencies.

- Test files live in `apps/api/src/test/**/*.test.ts` (bun discovers `*.test.ts`).
- Shared helpers live OUTSIDE the test folder (`apps/api/src/lib/test-helpers.ts`) so the runner never treats them as a test file.
- Scripts (R1):
  - `apps/api/package.json`: `"test": "bun test --preload ./src/test/setup.ts"` (see §3 for why preload).
  - Root `package.json`: `"test": "bun --cwd apps/api test"`.
- **Serial execution** (R5): `apps/api/bunfig.toml` → `[test] serial = true`. Files share one database; parallel file execution would race on resets.

---

## 2. App Refactor for Testability (R3)

`src/index.ts` currently builds the app AND calls `.listen(3000)` inline. Elysia's in-process test API is `app.handle(new Request(...))` — the app instance must be importable without binding a port.

- Extract the whole app builder (plugins, routes, error handler, `/health`) into **`src/app.ts`** exporting `const app = new Elysia()...` (no `.listen`).
- `src/index.ts` becomes: import `app` from `./app`, `.listen(3000)`, keep the startup log.
- All route modules are unchanged — this is a pure move.

---

## 3. Test Database (R2)

### Compose service

Add to `docker-compose.yml` (per [ADR-019](./../../docs/adr/ADR-019-incremental-docker-compose.md)):

```yaml
  postgres-test:
    image: postgres:18-alpine
    container_name: civicos-test-db
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: civicos_test
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
```

### Env override

`apps/api/src/database/client.ts` loads `.env.local` via `dotenv` with default `override: false` — an already-set `DATABASE_URL` wins. The test preload therefore sets `process.env.DATABASE_URL = "postgres://...@localhost:5433/civicos_test"` **before** any module imports `database/client`, so the whole app (including the `databasePlugin`) binds to the test database.

### Schema sync

`schema` is synchronized to the test DB with `drizzle-kit push` (same mechanism used for the dev DB). Script: `apps/api` `"db:push": "drizzle-kit push"`; the test preload spawns it once (guard with a flag so it runs once per process).

### Reset strategy (R5)

- `src/test/setup.ts` (preload): set `DATABASE_URL` → run `db:push` once → export a `resetDb()` helper.
- `resetDb()` truncates all tables (`users`, `citizens`, `announcements`, …) then re-seeds the baseline (see §4).
- Each test file calls `resetDb()` in its top-level `beforeAll`.

---

## 4. Test Helpers & Baseline Data

`src/lib/test-helpers.ts` (R2, R3):

- `api(app, path, { method, token, body })` — thin wrapper over `app.handle()`: builds the `Request` (JSON body, `Authorization: Bearer` when a token is given), returns `{ status, body }`.
- `login(app, email, password)` — calls the real login route and returns the access token (end-to-end, no JWT forging).
- `seedBaseline(db)` — deterministic baseline:
  - roles: the 4 seeded roles (reuse the names from `database/seed.ts`).
  - departments: `Population`, `Public Relations`.
  - users (password `TestPass123!`, hashed with `Bun.password.hash` like the dev seed):
    | Email | Role | Active |
    | --- | --- | --- |
    | `admin@civicos.test` | Administrator | yes |
    | `manager@civicos.test` | Manager | yes |
    | `officer@civicos.test` | Officer | yes |
    | `mayor@civicos.test` | Mayor | yes (announcement 403 cases) |
    | `inactive@civicos.test` | Officer | **no** (disabled login case) |

---

## 5. Unit Tests (R4)

### Announcement transitions — extract to service

Today the transition checks live in `announcement.routes.ts` (duplicated in the `publish` and `archive` handlers). Move them into a pure static method on `AnnouncementService`:

```ts
static assertTransition(current: Status, next: "published" | "archived") {
  const allowed: Record<Status, ("published" | "archived")[]> = {
    draft: ["published"],
    published: ["archived"],
    archived: ["published"], // republish
  };
  if (!allowed[current].includes(next)) {
    throw new AnnouncementTransitionError(current, next);
  }
}
```

`AnnouncementService.publish`/`archive` call `assertTransition` first; the routes keep their `findById` → 404 logic and map the error to `400 INVALID_STATUS_TRANSITION`. This also aligns with layered architecture ([ADR-004](./../../docs/adr/ADR-004-layered-architecture.md)) — business rules in the service layer.

Test file `src/test/unit/announcement-transition.test.ts`: full 3×3 matrix against `assertTransition` — no database needed.

### Pagination math — extract to `src/lib/pagination.ts`

`computeTotalPages(total, limit)` (currently inlined in `AnnouncementService.list` and `PopulationService.list`):

```ts
export function computeTotalPages(total: number, limit: number): number {
  if (limit <= 0) return 1;
  return Math.max(1, Math.ceil(total / limit));
}
```

Test file `src/test/unit/pagination.test.ts`: zero items, exact multiple, remainder, `limit = 0`, negative guards.

---

## 6. API Test Suites (R3)

One file per module under `src/test/api/`; each file:

1. imports `app` from `src/app.ts` (single shared instance),
2. `beforeAll(() => resetDb())`,
3. exercises the HTTP layer with `api()` + `login()` helpers.

| File | Baseline cases |
| --- | --- |
| `auth.test.ts` | login ok → token; wrong password → 401; unknown email → 401 (same shape as wrong password — no existence leak); disabled account → 401/`ACCOUNT_DISABLED`; `/me` with token → 200; `/me` without token → 401 |
| `users.test.ts` | list as officer → 200; list without token → 401; create as officer → 403; create as admin → 201; duplicate email → 409 `EMAIL_EXISTS`; self-deactivate → 400 `SELF_DEACTIVATION`; update unknown id → 404 |
| `population.test.ts` | paginated list (defaults, `totalPages`); search by NIK/name; gender filter; create → 201; duplicate NIK → 409 `CITIZEN_EXISTS`; NIK immutable on update; unknown id → 404; officer can mutate (per M6 guard) |
| `announcements.test.ts` | list + `status`/`departmentId` filters + pagination; create → draft; update title; publish draft → `published` + `publishedAt` stamped; publish published → 400; archive published → ok; archive draft → 400; republish archived → ok; mayor → 403; unknown id (detail/update/publish/archive) → 404 |

Validation-shape assertion (422) is covered once in `auth.test.ts` (malformed login body) since the global handler is shared.

---

## 7. Non-Goals

- No frontend component tests (deferred to backlog — M8 focuses on API + deploy).
- No E2E browser tests.
- No CI pipeline configuration (out of scope; a green `bun test` keeps the door open).
