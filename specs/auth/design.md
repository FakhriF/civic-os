# Authentication & Authorization — Design

> Status: Complete (implemented)
> Implements: [./requirements.md](./requirements.md)

## Overview

Authentication is implemented as an Elysia route group mounted at `/api/v1/auth` inside `apps/api`. Credentials are validated against the `users` table, a short-lived JWT access token (15 min) is returned, and a long-lived refresh cookie (7 days) is set for future refresh flows. Protected routes derive the current user globally from the `Authorization: Bearer` header via the shared `authMiddleware`.

## Architecture

| File                                        | Responsibility                                                                      |
| :------------------------------------------ | :---------------------------------------------------------------------------------- |
| `apps/api/src/modules/auth/auth.routes.ts`  | Route group `/api/v1/auth` (login, logout, me)                                      |
| `apps/api/src/modules/auth/auth.service.ts` | `AuthService.validateUser`: email lookup, deactivation check, password verification |
| `apps/api/src/modules/auth/auth.dto.ts`     | Request validation via Elysia `t.Object`                                            |
| `apps/api/src/app/middleware/auth.ts`       | Bearer token → derived `user` (global derive, checks `isActive`)                    |
| `apps/api/src/app/plugins/jwt.ts`           | `jwtAccess` (15m) and `jwtRefresh` (7d) JWT plugins                                 |
| `apps/api/src/database/schema/user.ts`      | `users` table definition                                                            |
| `apps/api/src/index.ts`                     | Mounts `authRoutes`                                                                 |

Frontend (`apps/web`) has no authentication screens yet; this design covers the backend only.

## API Changes

| Method | Endpoint              | Auth                    | Request               | Response                                                              | Errors                                                               |
| :----- | :-------------------- | :---------------------- | :-------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------- |
| `POST` | `/api/v1/auth/login`  | Public                  | `{ email, password }` | `{ status: "success", data: { accessToken, user } }` + refresh cookie | `401 INVALID_CREDENTIALS` / `401 ACCOUNT_DISABLED`; `422` validation |
| `POST` | `/api/v1/auth/logout` | Public (cookie removal) | —                     | `{ status: "success", message }`                                      | —                                                                    |
| `GET`  | `/api/v1/auth/me`     | Bearer token            | —                     | `{ status: "success", data: { user } }`                               | `401 UNAUTHORIZED`                                                   |

Note: `logout` is not protected by the auth middleware in the current implementation; it only removes the cookie.

## Database Changes

- Uses the existing `users`, `roles`, and `departments` tables (see [docs/database.md](../../docs/database.md) and `apps/api/src/database/schema/`).
- `users.is_active` boolean enables account deactivation per [ADR-020](../../docs/adr/ADR-020-soft-delete-user-accounts.md); `password_hash` stores the argon2id hash.
- Covered by migration `20260802174802_regular_matthew_murdock`.
- Seed (`apps/api/src/database/seed.ts`) inserts roles `Administrator`, `Manager`, `Mayor`, `Officer` and departments `Population`, `Public Relations`.

## Data Flow

**Login** (`POST /login`):

1. Body validated against `LoginBodyDTO` (email format, password ≥ 6 chars).
2. `AuthService.validateUser` looks up the user by email; returns `null` for unknown email or wrong password, `ACCOUNT_DISABLED` for inactive accounts.
3. On success: sign access token (`sub`, `email`, `roleId`, `departmentId`; exp 15m), sign refresh token (`sub`; exp 7d), set refresh cookie (`httpOnly`, `sameSite=strict`, `path=/api/v1/auth/refresh`, `maxAge=7d`), return tokens + profile.
4. On failure: `401` with `INVALID_CREDENTIALS` or `ACCOUNT_DISABLED`.

**Protected request** (`GET /me` and future routes):

1. `authMiddleware` reads `Authorization: Bearer <token>`, verifies `jwtAccess`, loads the user from DB by `sub`, rejects inactive users.
2. Derives `user` globally; routes can consume it without re-validating.

## Authentication & Authorization

- Access token payload: `sub`, `email`, `roleId`, `departmentId` — 15-minute expiry.
- Refresh token: `sub` only — 7-day expiry, delivered via httpOnly cookie.
- RBAC roles are seeded but authorization checks (per-role guards) are not yet implemented; role information is carried in the token for future use.
- Middleware verifies the user still exists and is active on every request (DB round-trip per request).

## Error Handling

Error responses follow the shape `{ status: "error", error: { code, message } }` with `set.status`:

| Code                  | HTTP | When                                                                      |
| :-------------------- | :--- | :------------------------------------------------------------------------ |
| `INVALID_CREDENTIALS` | 401  | Unknown email or wrong password (identical response, no enumeration)      |
| `ACCOUNT_DISABLED`    | 401  | Deactivated account tries to log in                                       |
| `UNAUTHORIZED`        | 401  | Missing / invalid / expired token, or deactivated user on protected route |
| Validation errors     | 422  | DTO validation failure (Elysia default)                                   |

> ⚠️ **Documented discrepancy**: `docs/development-standards.md` specifies `{ "success": true, ... }` as the response envelope, but the implemented API returns `{ "status": "success", ... }`. The contract doc does not match the implementation (per `agents.md`, AI must surface such inconsistencies to the developer rather than working around them silently).

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

- `POST /api/v1/auth/refresh` does not exist, although the refresh cookie is scoped to that path — refresh flow is unfinished.
- `/logout` is unauthenticated; acceptable for MVP but revisit if refresh tokens move server-side.
- `AuthService.validateUser` uses `db: any` — should be typed with the Drizzle query type once the shared types settle.
