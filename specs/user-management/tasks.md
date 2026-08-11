# User Management — Tasks

> Implements: [./design.md](./design.md)
> Status: In Progress (backend complete; frontend pending)

Every task references the requirement ID(s) it implements. The feature is only ready for verification when every requirement R1..Rn has at least one task.

## Backend

- [x] Add `GET /api/v1/roles` endpoint (R5)
- [x] Add `GET /api/v1/departments` endpoint (R5)
- [x] Implement `requireRole` guard (R5)
- [x] Implement `GET /api/v1/users` with role/department joins (R1)
- [x] Implement `POST /api/v1/users` with password hashing + duplicate-email handling (R2, R5)
- [x] Implement `PATCH /api/v1/users/:id` incl. `isActive` toggle (R3, R4, R5)
- [x] Add self-deactivation guard (R4.2)

## Frontend

- [ ] Implement `features/users/users-page.tsx` directory table (R1)
- [ ] Implement `user-form-dialog.tsx` create/edit modal (R2, R3)
- [ ] Implement `use-users.ts` query + mutations with cache invalidation (R1–R4)
- [ ] Populate role/department selects from `/roles` + `/departments` (R2, R3)
- [ ] Add deactivate action with confirmation + hide for own row (R4)
- [ ] Render empty state for an empty directory (R1)

## Testing

- [ ] Add API tests: directory auth, create (success/duplicate/forbidden), update (404/403), deactivate (R1–R5)
- [ ] Add unit tests for password hashing + payload mapping (R2)

## Verification

- [ ] Type checks pass (api + web)
- [ ] Lint/format pass (`bun run lint`)
- [ ] Manual verification: admin full flow + non-admin forbidden + self-deactivation blocked
- [ ] Spec reflects the final implementation
