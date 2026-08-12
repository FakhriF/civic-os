# Announcements — Tasks

> Implements: [./design.md](./design.md)
> Status: Draft

Every task references the requirement ID(s) it implements. The feature is only ready for verification when every requirement R1..Rn has at least one task.

## Backend

- [ ] Extend `GET /api/v1/announcements` to paginated list with `status`/`departmentId` filters (R1)
- [ ] Implement `GET /api/v1/announcements/:id` (R2)
- [ ] Implement `POST /api/v1/announcements` → `draft` with audit field (R3)
- [ ] Implement `PATCH /api/v1/announcements/:id` (R4)
- [ ] Implement `POST /api/v1/announcements/:id/publish` with transition validation (R5)
- [ ] Implement `POST /api/v1/announcements/:id/archive` with transition validation (R5)
- [ ] Guard mutations with `requireRole("Officer", "Manager", "Administrator")` (R3–R5)

## Frontend

- [ ] Implement `features/announcement/announcements-page.tsx` (filters, table, badges, pagination) (R1)
- [ ] Implement `announcement-form-dialog.tsx` create/edit modal (R3, R4)
- [ ] Implement `use-announcements.ts` query + create/update/publish/archive mutations (R1–R5)
- [ ] Add Publish/Archive actions per status (R5)
- [ ] Update `recent-bulletins.tsx` for the paginated response shape (R1)

## Testing

- [ ] Add API tests: list filters/pagination, create, publish/archive transitions, invalid transition → 400, forbidden → 403 (R1–R5)
- [ ] Add unit tests for transition validation (R5)

## Verification

- [ ] Type checks pass (api + web)
- [ ] Lint/format pass (`bun run lint`)
- [ ] Manual verification: full workflow draft → publish → archive → republish + dashboard bulletins still load
- [ ] Spec reflects the final implementation
