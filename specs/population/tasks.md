# Population Registry — Tasks

> Implements: [./design.md](./design.md)
> Status: In Progress (backend complete; frontend pending)

Every task references the requirement ID(s) it implements. The feature is only ready for verification when every requirement R1..Rn has at least one task.

## Backend

- [x] Move `requireRole` to `app/middleware/require-role.ts` and extend to multi-role (R3, R4)
- [x] Update `modules/user/user.routes.ts` to import the shared guard (R5)
- [x] Implement `GET /api/v1/citizens` with pagination, search, gender filter (R1)
- [x] Implement `GET /api/v1/citizens/:id` (R2)
- [x] Implement `POST /api/v1/citizens` with audit fields + duplicate NIK handling (R3, R5)
- [x] Implement `PATCH /api/v1/citizens/:id` with immutable NIK + `updatedById` (R4, R5)

## Frontend

- [ ] Implement `features/population/population-page.tsx` (search, filter, table, pagination) (R1)
- [ ] Implement `citizen-form-dialog.tsx` create/edit modal (R3, R4)
- [ ] Implement `use-citizens.ts` query + mutations with cache invalidation (R1–R4)
- [ ] Add debounced search via `useDebouncedValue` (R1)
- [ ] Render empty state for an empty registry (R1)

## Testing

- [ ] Add API tests: pagination, search, filter, create (duplicate/forbidden), update (404, NIK immutable) (R1–R5)
- [ ] Add unit tests for pagination math (R1)

## Verification

- [ ] Type checks pass (api + web)
- [ ] Lint/format pass (`bun run lint`)
- [ ] Manual verification: officer full flow + forbidden role + pagination
- [ ] Spec reflects the final implementation
