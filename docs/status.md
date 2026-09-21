# 📍 Project Status & Handoff

> **Last updated**: 2026-09-14
> **Read this first** when starting a new working session. It carries the current state, the open items, and the project's sharp edges, so nothing has to be re-explained.
> **Release state**: v1.0 Core MVP complete (M1–M8) · next planned release **v1.1 Transportation**

---

## 1. Snapshot

| Area           | State                                                                                             |
| :------------- | :------------------------------------------------------------------------------------------------ |
| v1.0 Core MVP  | Complete — Auth, App Shell, Dashboard, User Management, Population Registry, Announcements         |
| Backend        | Elysia + Drizzle + PostgreSQL; 7 domain modules under `apps/api/src/modules/`                      |
| Frontend       | React 19 + Mantine + TanStack Query; 5 feature modules under `apps/web/src/features/`              |
| Tests          | 54 passing (`bun run test`)                                                                        |
| Type safety    | `apps/api` compiles under the shared strict `tsconfig.base.json`; no `any` in service signatures    |

---

## 2. Latest session (2026-09-14)

### Public route guard fixed

- `/health` and `/` returned `401` because `authMiddleware` registers its hooks with `as: "global"`, so every route added after its plugins in `app.ts` is guarded. Both routes now register above the guarded `.use()` calls, and `apps/api/src/test/api/health.test.ts` covers unauthenticated access. Closes open item 6.

### Earlier session (2026-08-14)

Three threads, all verified with `tsc` + `bun run test` + Prettier.

#### a. Documentation reconciled with the code

- Purged every reference to a `packages/shared` workspace (`@civicos/shared`) and to Zod. Neither exists: the workspace is `apps/*` only, and request validation uses Elysia `t` (TypeBox).
- Added [**ADR-028**](./adr/ADR-028-api-web-type-contracts.md): the API is the source of truth for wire shapes, and the web app mirrors them as local interfaces per feature. Eden Treaty is the recorded, deferred upgrade path.
- Amended [ADR-012](./adr/ADR-012-feature-oriented-frontend.md) to the real frontend layout (bootstrap lives in `main.tsx`/`App.tsx`); deleted 11 empty, untracked directories that only existed on one machine.
- Fixed the README test command.

#### b. RBAC surfaced to the client

- `roleName` is returned by `POST /auth/login`, `POST /auth/refresh` and `GET /auth/me` (joined from `roles`), so the UI needs no extra request to `/api/v1/roles`.
- `usePermissions()` reads `user.roleName`; Administrator-only actions are hidden from other roles. Server-side `requireRole` remains the security boundary (ADR-024).

#### c. Type safety

- `apps/api` now extends `tsconfig.base.json`. Its strict flags (`noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`) had been written but never active.
- `db: any` replaced by `Database` (`typeof db` from `apps/api/src/database/client.ts`) across all services.

---

## 3. Open items

| #   | Item                          | Notes                                                                                                                    |
| :-- | :---------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| 1   | **Visual verification pending** | The Admin/non-Admin table layout (Actions column) and the role label in the app shell were verified by tooling only — never in a browser. |
| 2   | Eden Treaty adoption          | Deferred. Revisit when the domain count grows (v1.1+). See ADR-028.                                                       |
| 3   | Relational queries            | `drizzle()` is called without `schema`, so `db.query.*` is unavailable. Pass `schema` if it is ever needed.               |
| 4   | Module doc coverage           | `docs/modules/` documents `auth`, `user`, `population`, `announcement`. `dashboard`, `role`, `department` are deliberately undocumented supporting modules. |
| 5   | v1.1 Transportation           | Next release per the [roadmap](./roadmap.md). Spec drafted: [`specs/transportation/`](../specs/transportation/) (requirements, design, tasks); driver identity decided in [ADR-029](./adr/ADR-029-driver-identity-and-transportation-domain-modeling.md). Implementation not started. |

---

## 4. Sharp edges (learned the hard way)

- **Tests**: run `bun run test`, never plain `bun test`. The script passes `--preload ./src/test/setup.ts`, which points `DATABASE_URL` at the isolated test database; plain `bun test` skips the preload and hits the dev database.
- **Test database**: `docker compose up -d postgres-test` (port 5433) before running the suite.
- **Keep `db` typed**: service parameters must stay `Database`. Typing one as `any` silently disables checking for the whole data path — two real bugs slipped through exactly this way: `roleName` was lost on `/auth/refresh` (Admin lost buttons after a reload), and a Drizzle column object reached `JSON.stringify` (500, cyclic structure).
- **Mirror contract changes atomically**: an API response change and its web-side interface belong in the same commit (ADR-028).
- **No path alias**: imports are relative; `@/...` does not resolve.
- **UI changes need a browser**: start the dev stack with `docker compose up -d`. Type checks and tests do not cover layout.
- **Elysia global hooks leak**: `authMiddleware` registers its guard with `as: "global"`, so **every route added after it is protected** — including ones that look public. Keep unauthenticated routes above the guarded `.use(...)` calls, and add a test for every public route — `/health` and `/` were the cautionary example.
