# ADR-022: JWT Session Management with HttpOnly Refresh Cookie

> **Status**: Accepted  
> **Date**: 2026-08-10  
> **Deciders**: CivicOS Architecture Team

---

## 📌 Context & Problem Statement

CivicOS employees (Officer, Manager, Administrator, Mayor) authenticate with email and password and need a persistent session across page reloads and API calls. The session design must balance security against XSS token theft with a smooth user experience (no repeated logins). CivicOS runs a stateless REST API ([**ADR-003**](./ADR-003-rest-api.md)) and stores no session table today.

---

## 🎯 Decision Drivers

- **XSS Resistance**: Access tokens must not be readable by injected scripts.
- **Session Persistence**: Users stay signed in for up to 7 days without re-entering credentials.
- **Stateless API**: Keep the backend stateless; no server-side session storage.
- **Account Revocation**: Deactivated accounts ([**ADR-020**](./ADR-020-soft-delete-user-accounts.md)) must lose access immediately.

---

## 🔍 Considered Options

1. **Server-Side Sessions** (opaque session ID in a `sessions` table / Redis store)
2. **Single Long-Lived JWT in `localStorage`**
3. **JWT Access + Refresh Token Pair** (short-lived access token, long-lived refresh token)
4. **Access + Refresh with Rotation** (replace the refresh token on every refresh)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 3 — Short-lived JWT access token + long-lived refresh token in an HttpOnly cookie**, without rotation for the MVP.

- **Access token**: signed with `JWT_SECRET`, **15-minute expiry**, payload `{ sub, email, roleId, departmentId }`.
- **Refresh token**: signed with `JWT_REFRESH_SECRET`, **7-day expiry**, delivered only as an `httpOnly`, `sameSite=strict` cookie scoped to `/api/v1/auth/refresh`.
- **Frontend storage**: the access token lives **in memory only** (never `localStorage`) and is attached by the axios request interceptor (`apps/web/src/services/api-client.ts`).
- **Silent refresh**: on `401`, the response interceptor calls `/refresh` and queues concurrent requests; a failed refresh signs the user out.
- **Session restore**: on page reload, `AuthProvider` restores the session by calling `/refresh`.

### Consequences & Rules:

1. **Secrets**: `JWT_SECRET` and `JWT_REFRESH_SECRET` MUST come from the environment ([**ADR-021**](./ADR-021-environment-configuration.md)); the server fails fast at startup if either is missing.
2. **Deactivation**: login, refresh, and the auth middleware MUST reject `isActive = false` accounts ([**ADR-020**](./ADR-020-soft-delete-user-accounts.md)).
3. **No storage APIs**: access tokens never touch `localStorage`/`sessionStorage`.
4. **Separate secrets**: access and refresh tokens MUST be signed with different secrets so a leaked access token cannot be used to refresh.
5. **Cookie deletion**: the refresh cookie MUST be cleared by repeating its exact path (`/api/v1/auth/refresh`). Elysia's `remove()` drops the path attribute, so logout and refresh-failure paths set an explicit expired cookie instead.

### Consequences & Trade-offs:

- **Pros**:
  - Stateless backend; no session storage.
  - Access token protected from XSS (memory) and refresh token protected from XSS (HttpOnly).
  - Short access-token lifetime limits the blast radius of a stolen bearer token.
  - Deactivation is enforced immediately on every request (DB check in the middleware).
- **Cons & Trade-offs**:
  - Without rotation, a stolen refresh cookie stays valid for 7 days — rotation (Option 4) is the planned hardening.
  - The access token is lost on a full page reload, requiring a `/refresh` round-trip (cheap, same-origin proxy per [**ADR-023**](./ADR-023-same-origin-api-proxy.md)).
  - Concurrent `401`s need a refresh queue to avoid refreshing in parallel.

---

## 📎 References

- [**ADR-003** REST API](./ADR-003-rest-api.md) · [**ADR-020** Soft Delete](./ADR-020-soft-delete-user-accounts.md) · [**ADR-021** Environment Config](./ADR-021-environment-configuration.md) · [**ADR-023** Same-Origin Proxy](./ADR-023-same-origin-api-proxy.md)
- Implementation: `apps/api/src/modules/auth/*`, `apps/api/src/app/middleware/auth.ts`, `apps/api/src/app/plugins/jwt.ts`, `apps/web/src/services/api-client.ts`, `apps/web/src/features/authentication/*`
- Specification: [`specs/auth/`](../../specs/auth/)
