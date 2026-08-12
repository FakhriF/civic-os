# Population Registry — Requirements

> Status: Draft
> Related roadmap milestone: v1.0 M6 — Population Module
> Owner: CivicOS team

## Overview

The population registry stores the city's citizen records. Officers manage the registry (create and update records), while the data is readable by every authenticated employee. Records are permanent — there is no delete, to preserve the municipal audit trail. The National ID (NIK) is the unique identity of each citizen.

## Functional Requirements

### R1 — Citizen List (Paginated & Searchable)

The system SHALL list citizens with pagination, search, and gender filtering.

#### Acceptance Criteria

- R1.1 Any authenticated user can fetch the list.
- R1.2 The response includes `items`, `total`, `page`, `limit`, and `totalPages`.
- R1.3 `search` matches partial National ID or full name (case-insensitive).
- R1.4 `gender` filters by the enum (`male` | `female` | `other`).
- R1.5 Default `limit` is 10, maximum 50; default `page` is 1.

#### Edge Cases

- An empty result set returns an empty `items` array with `total: 0`.
- Pages beyond the last page return an empty `items` array (not an error).

### R2 — Citizen Detail

The system SHALL return a single citizen by id.

#### Acceptance Criteria

- R2.1 Any authenticated user can fetch a detail.
- R2.2 Unknown id returns `404`, code `CITIZEN_NOT_FOUND`.

### R3 — Create Citizen

The system SHALL allow Officer, Manager, or Administrator roles to create a citizen record.

#### Acceptance Criteria

- R3.1 A duplicate National ID is rejected with `409`, code `CITIZEN_EXISTS`.
- R3.2 Validation rejects malformed National ID, missing fields, and invalid gender or birth date.
- R3.3 `createdById` and `updatedById` are set from the authenticated user (R5).

#### Edge Cases

- National IDs are unique across the whole registry, not per user.

### R4 — Update Citizen

The system SHALL allow Officer, Manager, or Administrator roles to update a citizen's profile fields.

#### Acceptance Criteria

- R4.1 The National ID cannot be changed (it is the citizen's identity, like email for users).
- R4.2 `updatedById` reflects the last editor (R5).
- R4.3 Unknown id returns `404`, code `CITIZEN_NOT_FOUND`.

### R5 — Audit Tracking

The system SHALL record who created and last updated every citizen record.

#### Acceptance Criteria

- R5.1 `createdById` is set at creation and never changes.
- R5.2 `updatedById` is set to the current user on every update.
- R5.3 Audit values come from the authenticated token, never from the request body.

## Non-Functional Requirements

- NFR1 Responses SHALL follow the CivicOS API contract (`{ status, data }` / `{ status, error: { code, message } }`).
- NFR2 Validation failures return `422` with code `VALIDATION`.
- NFR3 No hard delete — registry records are permanent (audit trail).

## Out of Scope

- Delete / archive / soft-deactivate citizen records.
- Import/export (CSV) and bulk operations.
- Marriage/family or birth/death certificate features.
- Advanced search (NIK auto-suggest, multi-field filters beyond gender).
