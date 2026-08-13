# Authentication & Authorization — Design

> Status: Complete (implemented)
> Implements: [./requirements.md](./requirements.md)

## Overview

Authentication is implemented as an Elysia route group mounted at `/api/v1/auth` inside `apps/api`. Credentials are validated against the `users` table, a short-lived JWT access token (15 min) is returned, and a long-lived refresh cookie (7 days) is set to obtain new access tokens via `POST /refresh`. Protected routes derive the current user globally from the `Authorization: Bearer` header via the shared `authMiddleware`.

## Architecture

| File                                                       | Responsibility                                                                 |
| :--------------------------------------------------------- | :----------------------------------------------------------------------------- |
| `apps/api/src/modules/auth/auth.routes.ts`                 | Route group `/api/v1/auth` (login, logout, refresh, me)                        |
| `apps/api/src/modules/auth/auth.service.ts`                | `AuthService.validateUser` (login); `findActiveUserById` (refresh)             |
| `apps/api/src/modules/auth/auth.dto.ts`                    | Request validation via Elysia `t.Object`                                       |
| `apps/api/src/app/middleware/auth.ts`                      | Bearer token → derived `user` + 401 enforcement (global derive + beforeHandle) |
| `apps/api/src/app/plugins/jwt.ts`                          | `jwtAccess` (15m) and `jwtRefresh` (7d) JWT plugins                            |
| `apps/api/src/database/schema/user.ts`                     | `users` table definition                                                       |
| `apps/api/src/index.ts`                                    | Mounts `authRoutes`                                                            |
| `apps/web/src/services/api-client.ts`                      | Axios client: in-memory token, bearer interceptor, silent refresh queue        |
| `apps/web/src/features/authentication/auth-context.tsx`    | `AuthProvider`/`useAuth`: session state, login/logout, restore on mount        |
| `apps/web/src/features/authentication/login-page.tsx`      | Mantine login form                                                             |
| `apps/web/src/features/authentication/protected-route.tsx` | Route guard, redirects to `/login`                                             |
| `apps/web/src/App.tsx`, `main.tsx`                         | Router wiring + providers                                                      |

The web frontend consumes these endpoints: `apps/web/src/services/api-client.ts` (axios instance with in-memory token and silent refresh queue), `apps/web/src/features/authentication/auth-context.tsx` (session state provider), `login-page.tsx` (Mantine login form), and `protected-route.tsx` (route guard). Routing uses React Router v8 (`App.tsx`), with `AuthProvider` + `BrowserRouter` mounted in `main.tsx`. In development, Vite proxies `/api` to the API via `VITE_API_PROXY_TARGET`.

## API Changes

| Method | Endpoint               | Auth                    | Request               | Response                                                              | Errors                                                               |
| :----- | :--------------------- | :---------------------- | :-------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------- |
| `POST` | `/api/v1/auth/login`   | Public                  | `{ email, password }` | `{ status: "success", data: { accessToken, user } }` + refresh cookie | `401 INVALID_CREDENTIALS` / `401 ACCOUNT_DISABLED`; `422` validation |
| `POST` | `/api/v1/auth/logout`  | Public (cookie removal) | —                     | `{ status: "success", message }`                                      | —                                                                    |
| `POST` | `/api/v1/auth/refresh` | Public (refresh cookie) | —                     | `{ status: "success", data: { accessToken, user } }`                  | `401 UNAUTHORIZED`                                                   |
| `GET`  | `/api/v1/auth/me`      | Bearer token            | —                     | `{ status: "success", data: { user } }`                               | `401 UNAUTHORIZED`                                                   |

Note: `logout` is not protected by the auth middleware in the current implementation; it only removes the cookie.

## Database Changes

- Uses the existing `users`, `roles`, and `departments` tables (see [docs/database.md](../../docs/database.md) and `apps/api/src/database/schema/`).
- `users.is_active` boolean enables account deactivation per [ADR-020](../../docs/adr/ADR-020-soft-delete-user-accounts.md); `password_hash` stores the argon2id hash.
- Covered by migration `20260802174802_regular_matthew_murdock`.
- Seed (`apps/api/src/database/seed.ts`) inserts roles `Administrator`, `Manager`, `Mayor`, `Officer`, departments `Population` and `Public Relations`, and a default admin user whose credentials come from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (dev-only env defaults, ADR-021).

## Data Flow

**Login** (`POST /login`):

1. Body validated against `LoginBodyDTO` (email format, password ≥ 6 chars).
2. `AuthService.validateUser` looks up the user by email; returns `null` for unknown email or wrong password, `ACCOUNT_DISABLED` for inactive accounts.
3. On success: sign access token (`sub`, `email`, `roleId`, `departmentId`; exp 15m), sign refresh token (`sub`; exp 7d), set refresh cookie (`httpOnly`, `sameSite=strict`, `path=/api/v1/auth/refresh`, `maxAge=7d`), return tokens + profile.
4. On failure: `401` with `INVALID_CREDENTIALS` or `ACCOUNT_DISABLED`.

**Refresh** (`POST /refresh`):

1. Read the `refreshToken` cookie; missing → `401 UNAUTHORIZED`.
2. `jwtRefresh.verify`; invalid/expired → clear cookie + `401 UNAUTHORIZED`.
3. `AuthService.findActiveUserById`; missing or deactivated user → clear cookie + `401 UNAUTHORIZED`.
4. Sign a new access token with the login payload shape (`sub`, `email`, `roleId`, `departmentId`) and return it. No rotation in MVP — the refresh cookie is not replaced.

**Protected request** (`GET /me` and future routes):

1. `authMiddleware` reads `Authorization: Bearer <token>`, verifies `jwtAccess`, loads the user from DB by `sub`, rejects inactive users.
2. Derives `user` globally; routes can consume it without re-validating.

**Logout** (`POST /logout`):

1. Clears the refresh cookie by repeating the exact attributes from login (`path=/api/v1/auth/refresh`, `maxAge=0`, `expires` in the past). Browser deletion requires identical name + domain + path, so the path must be repeated explicitly.
2. Returns a success message; idempotent when no cookie is present.

**Frontend flow**:

1. On first load, `AuthProvider` calls `POST /refresh` to restore the session from the HttpOnly cookie.
2. The access token is kept in memory and attached to every request by the `api-client` request interceptor.
3. A `401` response triggers a silent refresh (queuing concurrent requests); a failed refresh signs the user out.
4. `ProtectedRoute` redirects unauthenticated users to `/login`; a successful login navigates to the home page.

## Authentication & Authorization

- Access token payload: `sub`, `email`, `roleId`, `departmentId` — 15-minute expiry.
- Refresh token: `sub` only — 7-day expiry, delivered via httpOnly cookie.
- RBAC roles are seeded but authorization checks (per-role guards) are not yet implemented; role information is carried in the token for future use.
- Middleware verifies the user still exists and is active on every request (DB round-trip per request).
- Protected routes are enforced by a global `onBeforeHandle` in `authMiddleware`: unauthenticated requests are rejected with `401 UNAUTHORIZED` **before the handler runs**, so handlers never need to check `user` themselves.

## Error Handling

Error responses follow the shape `{ status: "error", error: { code, message } }` with `set.status`:

| Code                  | HTTP | When                                                                     |
| :-------------------- | :--- | :----------------------------------------------------------------------- |
| `INVALID_CREDENTIALS` | 401  | Unknown email or wrong password (identical response, no enumeration)     |
| `ACCOUNT_DISABLED`    | 401  | Deactivated account tries to log in                                      |
| `UNAUTHORIZED`        | 401  | Missing / invalid / expired bearer or refresh token, or deactivated user |
| `VALIDATION`          | 422  | DTO validation failure (normalized from Elysia's `ValidationError`)      |

> ✅ **Resolved (2026-08-10)**: `docs/development-standards.md` previously specified a `{ "success": true, ... }` envelope; it now documents the implemented `{ "status": "success", ... }` / `{ "status": "error", "error": { "code", "message" } }` contract.

## Security Considerations

- Passwords verified with `Bun.password.verify` (argon2id); plaintext never stored.
- Refresh cookie: `httpOnly`, `sameSite=strict`, scoped path, 7-day `maxAge`.
- Failure responses are identical for unknown email vs wrong password (no user enumeration).
- ✅ NFR4 satisfied: `apps/api/src/app/plugins/jwt.ts` reads `JWT_SECRET` / `JWT_REFRESH_SECRET` strictly from the environment and fails fast with a clear message if either is missing (ADR-021).
- ⚠️ No rate limiting or account lockout (accepted for MVP; tracked as future work).
- ⚠️ Emails are matched exactly (case-sensitive); not normalized to lowercase before lookup.

## Testing Strategy

Not yet implemented — no unit, API, or E2E tests exist for the auth module. Planned under v1.0 M8 (Testing & Deploy).

## Known Gaps / Open Questions

- `/logout` is unauthenticated; acceptable for MVP but revisit if refresh tokens move server-side.
- `AuthService.validateUser` uses `db: any` — should be typed with the Drizzle query type once the shared types settle.
