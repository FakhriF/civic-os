# Announcements — Tasks

> Implements: [./design.md](./design.md)
> Status: Complete (automated tests pending)

Every task references the requirement ID(s) it implements. The feature is only ready for verification when every requirement R1..Rn has at least one task.

## Backend

- [x] Extend `GET /api/v1/announcements` to paginated list with `status`/`departmentId` filters (R1)
- [x] Implement `GET /api/v1/announcements/:id` (R2)
- [x] Implement `POST /api/v1/announcements` → `draft` with audit field (R3)
- [x] Implement `PATCH /api/v1/announcements/:id` (R4)
- [x] Implement `POST /api/v1/announcements/:id/publish` with transition validation (R5)
- [x] Implement `POST /api/v1/announcements/:id/archive` with transition validation (R5)
- [x] Guard mutations with `requireRole("Officer", "Manager", "Administrator")` (R3–R5)

## Frontend

- [x] Implement `features/announcement/announcements-page.tsx` (filters, table, badges, pagination) (R1)
- [x] Implement `announcement-form-dialog.tsx` create/edit modal (R3, R4)
- [x] Implement `use-announcements.ts` query + create/update/publish/archive mutations (R1–R5)
- [x] Add Publish/Archive actions per status (R5)
- [x] Update `recent-bulletins.tsx` for the paginated response shape (R1)
- [x] Extract shared `useRoleOptions`/`useDepartmentOptions` to `lib/use-options.ts` (ADR-025)

## Testing

- [ ] Add API tests: list filters/pagination, create, publish/archive transitions, invalid transition → 400, forbidden → 403 (R1–R5)
- [ ] Add unit tests for transition validation (R5)

## Verification

- [x] Type checks pass (api + web)
- [x] Lint/format pass (`bun run lint`)
- [x] Manual verification: full workflow draft → publish → archive → republish + dashboard bulletins still load
- [x] Spec reflects the final implementation
