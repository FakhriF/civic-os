# User Management — Requirements

> Status: Draft
> Related roadmap milestone: v1.0 M5 — User Management
> Owner: CivicOS team

## Overview

CivicOS employees (Officer, Manager, Administrator, Mayor) are managed through a user directory. Administrators create and maintain accounts, assign roles and departments, and deactivate accounts that leave — never deleting them (ADR-020 soft delete). Viewing the directory is available to any authenticated user.

## Functional Requirements

### R1 — User Directory

The system SHALL list user accounts with name, email, role, department, and active status.

#### Acceptance Criteria

- R1.1 Any authenticated user can fetch the user list.
- R1.2 Each entry includes `id`, `fullName`, `email`, role name, department name, and `isActive`.
- R1.3 Deactivated users remain in the list, marked inactive.

#### Edge Cases

- Empty list renders an empty state, not an error.
- Role and department names are resolved via their foreign keys.

### R2 — Create User Account

The system SHALL allow an Administrator to create an account with email, full name, password, role, and department.

#### Acceptance Criteria

- R2.1 The password is stored as an argon2id hash, never plaintext.
- R2.2 A duplicate email is rejected with `409`, code `EMAIL_EXISTS`.
- R2.3 Validation rejects malformed email and passwords shorter than 6 characters.
- R2.4 New accounts are active by default.

#### Edge Cases

- Creating a user with a non-existent role or department is rejected.

### R3 — Update User Profile

The system SHALL allow an Administrator to update a user's full name, role, department, and optionally reset the password.

#### Acceptance Criteria

- R3.1 Only an Administrator can update a user.
- R3.2 Unknown user id returns `404`, code `USER_NOT_FOUND`.
- R3.3 Role changes take effect on the user's next access token (existing tokens keep the old role until expiry).

#### Edge Cases

- Updating the email is out of scope for this milestone (email is the account identifier).

### R4 — Deactivate / Reactivate Account

The system SHALL allow an Administrator to toggle a user's active status (ADR-020 soft delete).

#### Acceptance Criteria

- R4.1 Deactivated users cannot log in or use their tokens (enforced by the existing auth flow).
- R4.2 An Administrator cannot deactivate their own account.
- R4.3 Reactivating restores access without data loss.

### R5 — Role-Based Access Control

The system SHALL restrict account mutations to the Administrator role; the directory remains readable by any authenticated user.

#### Acceptance Criteria

- R5.1 Create, update, and deactivate by a non-Administrator return `403`, code `FORBIDDEN`.
- R5.2 Unauthenticated requests return `401`, code `UNAUTHORIZED` (existing middleware).
- R5.3 The role check is enforced server-side on every mutation, never only in the UI.

## Non-Functional Requirements

- NFR1 Passwords SHALL be hashed with argon2id (consistent with auth).
- NFR2 Responses SHALL follow the CivicOS API contract (`{ status, data }` / `{ status, error: { code, message } }`).
- NFR3 No hard deletion — deactivation only (ADR-020).

## Out of Scope

- Pagination and search/filtering (directory is small for now; revisit when it grows).
- Self-service profile page (users editing their own profile).
- Password reset flow (email-based) — M8+.
- Audit log UI for account changes.
