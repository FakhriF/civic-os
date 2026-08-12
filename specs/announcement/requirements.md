# Announcements — Requirements

> Status: Draft
> Related roadmap milestone: v1.0 M7 — Announcements
> Owner: CivicOS team

## Overview

Municipal bulletins are published through an announcement workflow: drafts are created, edited, published (which stamps `publishedAt`), and archived. Every announcement belongs to a department (its tag). Records are permanent — there is no delete; archiving is the terminal lifecycle state.

## Functional Requirements

### R1 — Announcement List (Paginated & Filterable)

The system SHALL list announcements with pagination, status filtering, and department filtering.

#### Acceptance Criteria

- R1.1 Any authenticated user can fetch the list.
- R1.2 The response includes `items`, `total`, `page`, `limit`, and `totalPages`.
- R1.3 `status` filters by `draft` | `published` | `archived`.
- R1.4 `departmentId` filters by the owning department.
- R1.5 Default `limit` is 10, maximum 50; default `page` is 1.

#### Edge Cases

- An empty result set returns an empty `items` array with `total: 0`.

### R2 — Announcement Detail

The system SHALL return a single announcement by id.

#### Acceptance Criteria

- R2.1 Any authenticated user can fetch a detail.
- R2.2 Unknown id returns `404`, code `ANNOUNCEMENT_NOT_FOUND`.

### R3 — Create Announcement

The system SHALL allow Officer, Manager, or Administrator roles to create an announcement.

#### Acceptance Criteria

- R3.1 `title`, `content`, and `departmentId` are required and validated.
- R3.2 `createdById` is set from the authenticated user.
- R3.3 New announcements start in `draft` status.

### R4 — Update Announcement

The system SHALL allow Officer, Manager, or Administrator roles to edit `title`, `content`, and `departmentId`.

#### Acceptance Criteria

- R4.1 Unknown id returns `404`, code `ANNOUNCEMENT_NOT_FOUND`.
- R4.2 `updatedAt` reflects the last change (audit).
- R4.3 Editing published content is allowed (the bulletin is corrected in place; `updatedAt` records it).

### R5 — Publish / Archive Workflow

The system SHALL expose explicit publish and archive actions that enforce valid status transitions.

#### Acceptance Criteria

- R5.1 `publish`: `draft` or `archived` → `published`, setting `publishedAt` to now.
- R5.2 `archive`: `published` → `archived`.
- R5.3 Any other transition returns `400`, code `INVALID_STATUS_TRANSITION`.
- R5.4 Unknown id returns `404`, code `ANNOUNCEMENT_NOT_FOUND`.

#### Edge Cases

- Republishing an archived announcement resets `publishedAt` to the new publish time.

### R6 — Department Tagging

Each announcement SHALL belong to exactly one department.

#### Acceptance Criteria

- R6.1 `departmentId` is required at creation.
- R6.2 The list can filter by `departmentId`.

## Non-Functional Requirements

- NFR1 Responses SHALL follow the CivicOS API contract (`{ status, data }` / `{ status, error: { code, message } }`).
- NFR2 Validation failures return `422` with code `VALIDATION`.
- NFR3 No hard delete — archiving is the terminal state.

## Out of Scope

- Delete / purge announcements.
- Scheduled publishing (`publishedAt` in the future).
- Comments, reactions, or read receipts.
- Email/notification delivery.
- Attachments or rich media in content.
- Editing `publishedAt` manually.

## Future Work

- **Department-based authorization**: restrict management to users of the announcement's own department (current RBAC is role-based — see backlog).
- **Scheduled publishing** with a publish queue.
