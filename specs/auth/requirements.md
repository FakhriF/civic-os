# Authentication & Authorization — Requirements

> Status: Complete (implemented; this specification documents the current implementation)
> Related roadmap milestone: v1.0 M2 — Authentication
> Owner: CivicOS team

## Overview

CivicOS backend shall authenticate municipal users (Officer, Manager, Administrator, Mayor) with email and password, issue short-lived JWT access tokens, and maintain session identity via an httpOnly refresh-token cookie. Deactivated accounts (ADR-020 soft delete) must be blocked from both login and token usage. The web frontend (`apps/web`) consumes these endpoints to provide a login page, session restore, and route protection.

## Functional Requirements

### R1 — User Login

The system SHALL authenticate a registered user with a valid email and password. On success it SHALL return a JWT access token plus the user profile, and set an httpOnly refresh-token cookie. On failure it SHALL respond 401 without revealing whether the email address exists.

#### Acceptance Criteria

- R1.1 Valid email and password return `200` with an `accessToken` and the user profile (id, email, fullName, roleId, departmentId).
- R1.2 A refresh-token cookie is set with `httpOnly`, `sameSite=strict`, and a 7-day lifetime.
- R1.3 Unknown email and wrong password produce the identical response: `401`, code `INVALID_CREDENTIALS`, message `"Invalid email or password."` (no user enumeration).
- R1.4 Login for a deactivated account (`isActive = false`) returns `401`, code `ACCOUNT_DISABLED`.
- R1.5 Malformed requests are rejected by validation: invalid email format or password shorter than 6 characters.

#### Edge Cases

- Empty or whitespace-only credentials are rejected by validation.
- Deactivated accounts never receive an access token.
- Repeated failed logins: no rate limiting or lockout in the current implementation (accepted for MVP, tracked as future work).

### R2 — Session Identity Retrieval

The system SHALL return the currently authenticated user for a valid bearer token via `GET /api/v1/auth/me`.

#### Acceptance Criteria

- R2.1 A valid, unexpired access token returns `200` with the user profile.
- R2.2 A missing, malformed, or expired token returns `401`, code `UNAUTHORIZED`.
- R2.3 A token issued for a deactivated account returns `401`, code `UNAUTHORIZED`.

#### Edge Cases

- Token with a `sub` that no longer maps to a user is rejected.
- Bearer header with wrong scheme (e.g. not prefixed `Bearer `) is rejected.

### R3 — Logout

The system SHALL invalidate the client session by removing the refresh-token cookie.

#### Acceptance Criteria

- R3.1 `POST /api/v1/auth/logout` removes the refresh cookie and returns a success response.
- R3.2 Logout is idempotent: calling it without a cookie still succeeds.

#### Edge Cases

- Cookie removal MUST repeat the exact cookie `Path` (`/api/v1/auth/refresh`). A `Path` mismatch leaves the original cookie in the browser, so the session can be silently restored on the next page refresh.

### R4 — Account Deactivation Enforcement

The system SHALL block authentication for deactivated accounts in every flow.

#### Acceptance Criteria

- R4.1 Deactivated users cannot log in (R1.4).
- R4.2 Deactivated users cannot access protected endpoints (R2.3).
- R4.3 No access or refresh token is issued to a deactivated account.

### R5 — Token Refresh

The system SHALL issue a new access token from a valid refresh-token cookie via `POST /api/v1/auth/refresh`.

#### Acceptance Criteria

- R5.1 A valid refresh cookie returns `200` with a new `accessToken` and the user profile (same shape as login).
- R5.2 A missing, invalid, or expired refresh token returns `401`, code `UNAUTHORIZED`, and the refresh cookie is cleared.
- R5.3 A refresh token for a missing or deactivated user returns `401`, code `UNAUTHORIZED`, and the refresh cookie is cleared.
- R5.4 The new access token has the same payload shape as login (`sub`, `email`, `roleId`, `departmentId`).

#### Edge Cases

- Expired refresh token (7-day lifetime): the request fails and the cookie is cleared to prevent a stuck 401 loop.
- No token rotation in MVP: the refresh cookie is not replaced when refreshing.

### R6 — Web Authentication Flow

The web frontend SHALL provide a login page and protect private pages behind a route guard, restoring the session from the refresh cookie.

#### Acceptance Criteria

- R6.1 Unauthenticated users are redirected from protected pages to `/login`.
- R6.2 Valid credentials sign the user in, store the access token in memory only (never `localStorage`), and navigate to the home page.
- R6.3 Refreshing the page restores the session via `POST /api/v1/auth/refresh`.
- R6.4 A `401` response triggers a silent refresh; if the refresh fails, the user is signed out.
- R6.5 Logout clears the session and returns to `/login`.

## Non-Functional Requirements

- NFR1 Passwords SHALL be stored only as hashes (argon2id), never plaintext.
- NFR2 Access tokens SHALL expire after 15 minutes; refresh cookies after 7 days.
- NFR3 Refresh cookies SHALL be `httpOnly` and `sameSite=strict`.
- NFR4 JWT signing secrets SHALL come from environment variables (ADR-021), never from source code.
- NFR5 Error responses SHALL follow the CivicOS API contract and must not leak internal details.

## Out of Scope

- Password reset / change, email verification, MFA.
- Rate limiting / account lockout.
- RBAC permission matrix beyond role assignment carried in the token.
