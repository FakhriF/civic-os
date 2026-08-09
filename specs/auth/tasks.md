# Authentication & Authorization — Tasks

> Implements: [./design.md](./design.md)
> Status: In Progress (backend implemented; tests pending)

Every task references the requirement ID(s) it implements. The feature is only ready for verification when every requirement R1..Rn has at least one task.

## Backend

- [x] Define `users`, `roles`, `departments` schema and migration (R4)
- [x] Seed roles (`Administrator`, `Manager`, `Mayor`, `Officer`), departments, and a default admin user (R1)
- [x] Implement `AuthService.validateUser` with email lookup, deactivation check, and password verification (R1, R4)
- [x] Implement `POST /api/v1/auth/login` with access token + refresh cookie (R1)
- [x] Implement `POST /api/v1/auth/logout` (R3)
- [x] Implement `POST /api/v1/auth/refresh` with cookie verification (R5)
- [x] Implement `authMiddleware` bearer-token derive with `isActive` check (R2, R4)
- [x] Implement `GET /api/v1/auth/me` (R2)
- [x] Add JWT access/refresh plugins (`jwtAccess` 15m, `jwtRefresh` 7d) (R1, R2)
- [x] Add request validation via `LoginBodyDTO` (R1)
- [x] Read JWT secrets strictly from environment with fail-fast, no hardcoded fallbacks (NFR4, ADR-021)
- [x] Inject `JWT_SECRET` / `JWT_REFRESH_SECRET` into the Docker container via `docker-compose.yml` (NFR4, ADR-021)

## Frontend

- [ ] Implement login screen (`apps/web/src/features/authentication`) (R1) — future work
- [ ] Implement route guard for protected pages (R2) — future work

## Testing

- [ ] Add unit tests for `AuthService.validateUser` (R1, R4)
- [ ] Add API tests: login, refresh (valid/invalid/expired), `/me` valid/invalid token, logout (R1, R2, R3, R4, R5)

## Verification

- [x] Type checks pass (`tsconfig` bundler resolution + `refreshToken.value` cast)
- [ ] Lint/format pass — **blocked**: root `lint` script is a stub (`echo "Not implemented"`)
- [x] Manual verification of login, logout, refresh, and `/me` flows against the running API
- [x] Spec reflects the final implementation
- [x] `docs/modules/auth.md` overview kept up to date (linked to this spec)

## Future Work (outside this specification's scope)

- [ ] Add rate limiting / account lockout
- [ ] Normalize email to lowercase before lookup
- [ ] Type `AuthService.validateUser` instead of `db: any`
- [ ] Rotate JWT secrets — current dev values are the former hardcoded fallbacks (publicly known); `.env.example` must use non-sensitive placeholders
- [ ] Add `.env.local` to `apps/api/.dockerignore` (ADR-015) — currently baked into the Docker image
