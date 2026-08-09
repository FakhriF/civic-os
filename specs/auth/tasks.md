# Authentication & Authorization — Tasks

> Implements: [./design.md](./design.md)
> Status: In Progress (backend implemented; tests and refresh flow pending)

Every task references the requirement ID(s) it implements. The feature is only ready for verification when every requirement R1..Rn has at least one task.

## Backend

- [x] Define `users`, `roles`, `departments` schema and migration (R4)
- [x] Seed roles (`Administrator`, `Manager`, `Mayor`, `Officer`) and departments (R1)
- [x] Implement `AuthService.validateUser` with email lookup, deactivation check, and password verification (R1, R4)
- [x] Implement `POST /api/v1/auth/login` with access token + refresh cookie (R1)
- [x] Implement `POST /api/v1/auth/logout` (R3)
- [x] Implement `authMiddleware` bearer-token derive with `isActive` check (R2, R4)
- [x] Implement `GET /api/v1/auth/me` (R2)
- [x] Add JWT access/refresh plugins (`jwtAccess` 15m, `jwtRefresh` 7d) (R1, R2)
- [x] Add request validation via `LoginBodyDTO` (R1)
- [x] Read JWT secrets strictly from environment with fail-fast, no hardcoded fallbacks (NFR4, ADR-021)

## Frontend

- [ ] Implement login screen (`apps/web/src/features/authentication`) (R1) — future work
- [ ] Implement route guard for protected pages (R2) — future work

## Testing

- [ ] Add unit tests for `AuthService.validateUser` (R1, R4)
- [ ] Add API tests: login success/failure/disabled, `/me` valid/invalid token, logout (R1, R2, R3, R4)

## Verification

- [ ] Type checks pass — **blocked**: `tsc --noEmit` currently fails with TS5107 (`moduleResolution: "node"` deprecated in TypeScript 6.0) in `apps/api/tsconfig.json`; pre-existing, unrelated to auth code
- [ ] Lint/format pass — **blocked**: root `lint` script is a stub (`echo "Not implemented"`)
- [x] Manual verification of login/logout/me flows against the running API (commit `b98e9d9`)
- [x] Spec reflects the final implementation
- [x] `docs/modules/auth.md` overview kept up to date (linked to this spec)

## Future Work (outside this specification's scope)

- [ ] Implement `POST /api/v1/auth/refresh` (cookie path already prepared)
- [ ] Add rate limiting / account lockout
- [ ] Normalize email to lowercase before lookup
- [ ] Type `AuthService.validateUser` instead of `db: any`
