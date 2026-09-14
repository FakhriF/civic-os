# Announcements — Design

> Status: Complete
> Implements: [./requirements.md](./requirements.md)

## Overview

The existing `announcement` module (created for the M4 dashboard slice) is extended from a single read-only endpoint into the full bulletin workflow: paginated list, detail, create, update, publish, and archive. The frontend adds a `features/announcement` directory with a filterable table and a create/edit dialog, reusing the M5/M6 patterns.

## Architecture

| File | Responsibility |
| :--- | :--- |
| `apps/api/src/modules/announcement/announcement.routes.ts` | **Extended**: list/detail/create/update/publish/archive |
| `apps/api/src/modules/announcement/announcement.service.ts` | **New**: list with filters, findById, create/update, transition validation |
| `apps/web/src/features/announcement/announcements-page.tsx` | Filterable, paginated table |
| `apps/web/src/features/announcement/announcement-form-dialog.tsx` | Create/edit modal |
| `apps/web/src/features/announcement/use-announcements.ts` | TanStack Query: list + mutations |
| `apps/web/src/features/dashboard/recent-bulletins.tsx` | **Updated** for the new paginated response shape |

## API Changes

| Method | Endpoint | Auth | Request | Response | Errors |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/announcements` | Bearer | query `page`, `limit`, `status`, `departmentId` | `{ status, data: { items, total, page, limit, totalPages } }` | `401` |
| `GET` | `/api/v1/announcements/:id` | Bearer | — | `{ status, data: Announcement }` | `401` / `404 ANNOUNCEMENT_NOT_FOUND` |
| `POST` | `/api/v1/announcements` | Bearer + Officer/Manager/Admin | `{ title, content, departmentId }` | `{ status, data: Announcement }` | `401` / `403` / `422 VALIDATION` |
| `PATCH` | `/api/v1/announcements/:id` | Bearer + Officer/Manager/Admin | partial `{ title?, content?, departmentId? }` | `{ status, data: Announcement }` | `401` / `403` / `404` / `422` |
| `POST` | `/api/v1/announcements/:id/publish` | Bearer + Officer/Manager/Admin | — | `{ status, data: Announcement }` | `401` / `403` / `404` / `400 INVALID_STATUS_TRANSITION` |
| `POST` | `/api/v1/announcements/:id/archive` | Bearer + Officer/Manager/Admin | — | `{ status, data: Announcement }` | `401` / `403` / `404` / `400 INVALID_STATUS_TRANSITION` |

`Announcement` payload: `{ id, title, content, status, publishedAt, departmentId, createdById, createdAt, updatedAt }`.

## Workflow & Transition Validation

Transitions are enforced in the service — never trusted from the client:

```
draft     --publish--> published --archive--> archived
archived  --publish--> published            (republish, resets publishedAt)
```

`publish`: allowed from `draft` or `archived`; sets `status = "published"`, `publishedAt = new Date()`.
`archive`: allowed only from `published`.
Any other combination → `400 INVALID_STATUS_TRANSITION`.

## Frontend Behavior

- `announcements-page.tsx`: filters (`Select` status + `Select` department) + Mantine `Table` (title, department, status badge, published date, actions) + `Pagination`. Search input is not in scope (list is filterable, not text-searchable — see requirements).
- Status badges follow the design tokens: `draft` = yellow, `published` = green, `archived` = gray.
- Row actions by status: `draft` → Edit, Publish · `published` → Edit, Archive · `archived` → Publish (republish), Edit.
- `announcement-form-dialog.tsx`: `TextInput` title, `Textarea` content, `Select` department (from `GET /departments`).
- `use-announcements.ts`: `useQuery({ queryKey: ["announcements", { page, limit, status, departmentId }] })`; `useCreateAnnouncement`, `useUpdateAnnouncement`, `usePublishAnnouncement`, `useArchiveAnnouncement` — all invalidate `["announcements"]`.

## Dashboard Compatibility

`recent-bulletins.tsx` currently calls `GET /api/v1/announcements?limit=5` and expects an array. The M7 list endpoint returns the paginated shape, so it must:

- pass `status=published` + `limit=5` + `page=1`, and
- read `res.data.data.items` instead of `res.data.data`.

## Error Handling

| Code | HTTP | When |
| :--- | :--- | :--- |
| `UNAUTHORIZED` | 401 | Missing/invalid token (middleware) |
| `FORBIDDEN` | 403 | Role not allowed for the action |
| `ANNOUNCEMENT_NOT_FOUND` | 404 | Unknown `:id` |
| `INVALID_STATUS_TRANSITION` | 400 | Publish/archive from a disallowed status |
| `VALIDATION` | 422 | DTO validation failure |

## Security Considerations

- `createdById` comes from the authenticated token only.
- Status transitions validated server-side (R5.3).
- No hard delete — archive is terminal (NFR3).

## Testing Strategy

- Unit: `announcement.service` transition validation + payload mapping.
- API tests: list filters/pagination, create, update, publish (draft/archived/republish), archive, invalid transitions → 400, forbidden role → 403.
- Component: dialog validation, status badges, action visibility per status.

## Open Questions

- None blocking; department-based authorization and scheduled publishing are Future Work.
