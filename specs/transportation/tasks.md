# Transportation & Municipal Transit — Tasks

> Implements: [./design.md](./design.md)
> Status: Draft

Every task references the requirement ID(s) it implements. The feature is only ready for verification when every requirement R1..R8 has at least one task. **Must-have** = required for v1.1; **stretch** = build after the must-have set is verified.

## Verify early (de-risk before replicating)

- [ ] Add a guard smoke test: confirm scoped `requireRole` inside one composed sub-router (`route.routes.ts`) still returns `403` for `Mayor` on a mutation and `401` unauthenticated — validate the Elysia composition before applying the pattern to all seven routers (M3)
- [ ] Confirm `CREATE EXTENSION IF NOT EXISTS btree_gist` succeeds when the drizzle migrator runs as the test user (`civicos`) and dev user (`civicos_userdb`); if not, switch the assignment guards to the transactional `SELECT ... FOR UPDATE` fallback (M4, NFR6)

## Backend

- [ ] Add `db:generate` script (`drizzle-kit generate`) to `apps/api/package.json`, matching `db:migrate`/`db:seed` (M6)
- [ ] Add `transportation.ts` schema (enums + 9 tables) and re-export from `schema/index.ts` (R1–R8, NFR4)
- [ ] Generate migration; hand-add `btree_gist` exclusion constraints and the one-active-schedule partial unique index (R6, R8, NFR6)
- [ ] Add `isExclusionViolation` helper (`23P01`) next to `isUniqueViolation` (R6)
- [ ] Extend `seed.ts`: `Transportation` department + idempotent demo dataset (routes, stops, route stops, vehicles, drivers) (R1–R3, R5)
- [ ] Register `transportationRoutes` in `app.ts` (R1–R8)
- [ ] `route.service.ts` + `route.routes.ts`: paginated list with `search`/`status`, detail, create, update, terminal-`retired` guard `400 ROUTE_STATUS_LOCKED` (R1)
- [ ] `stop.service.ts` + `stop.routes.ts`: paginated searchable directory, create/update with coordinate validation, `DELETE` blocked by `409 STOP_IN_USE`, `replaceRouteStops` transaction + ordered `GET` (R2)
- [ ] `vehicle.service.ts` + `vehicle.routes.ts`: paginated list with `status`/`inspectionDue`, CRUD, plate uniqueness, terminal-`retired` guard, `recordInspection` updating latest/next due (R3, R4.4–R4.6)
- [ ] `driver.service.ts` + `driver.routes.ts`: paginated list with `search`/`status`, create/update, license uniqueness, `userId` link uniqueness, deactivate-not-delete (R5)
- [ ] `assignment.service.ts` + `assignment.routes.ts`: roster list with filters, create/update, unknown-ref `404`s (R6.10), `rangesOverlap` pre-check, DB-constraint error mapping, cancel/complete, `scheduled`-only mutation guard (R6)
- [ ] `status.service.ts` + `status.routes.ts`: current status (newest row) + update with note/audit (R7)
- [ ] *(stretch)* `vehicle` maintenance endpoints: list + create records, inspection-due computation (R4)
- [ ] *(stretch)* `schedule.service.ts` + `schedule.routes.ts`: get active schedule, transactional upsert deactivating the previous, `DELETE` deactivation, `operatingDays` validation (R8)

## Frontend

- [ ] Add `features/transportation/use-transit.ts` query + mutation hooks with list invalidation (R1–R8)
- [ ] Extend `lib/use-options.ts` with `useRouteOptions`, `useDriverOptions`, `useVehicleOptions` (R6)
- [ ] `routes-page.tsx` + `route-form-dialog.tsx` (filters, table, status badges, pagination) (R1)
- [ ] `route-detail-page.tsx` with Stops (inline create/attach + reorder) / Status / Schedule (incl. deactivate) tabs (R2, R7, R8)
- [ ] `vehicles-page.tsx` + `vehicle-form-dialog.tsx` + record-inspection dialog (R3, R4)
- [ ] `drivers-page.tsx` + `driver-form-dialog.tsx` with optional user link (R5)
- [ ] `assignments-page.tsx` + `assignment-form-dialog.tsx` with cancel/complete actions (R6)
- [ ] Add "Transportation" navigation entries in the app shell (R1–R8)
- [ ] Loading/empty/error states for every list (NFR1)
- [ ] *(stretch)* maintenance history drawer (R4)

## Testing

- [ ] Extend `resetDb()` TRUNCATE list in `apps/api/src/lib/test-helpers.ts` with all 9 transit tables so test state does not leak between runs (M/B1)
- [ ] Unit: `rangesOverlap` / `assertNoOverlap` incl. adjacent-boundary and cancelled-status cases (R6)
- [ ] Unit: `operatingDays` validation and terminal-status guards (R1, R3, R8)
- [ ] API: route/stop/vehicle/driver CRUD + list filters + `422`/`404`/`409` (R1, R2, R3, R5)
- [ ] API: RBAC — unauthenticated `401`, `Mayor` mutation `403` (R1–R8, ADR-024)
- [ ] API: assignment overlap `409` for driver and vehicle, adjacent-boundary success, cancel frees the slot, edit beyond `scheduled` → `400` (R6)
- [ ] API: schedule one-active invariant across two upserts + deactivation leaves none (R8)
- [ ] API: operational status returns the newest row (R7)
- [ ] API: stop `DELETE` blocked by `409 STOP_IN_USE` while attached (R2)
- [ ] *(stretch)* API: maintenance records, inspection recording, inspection-due filter (R4)
- [ ] Component: dialog validation and list states for Routes and Assignments (R1, R6)

## Verification

- [ ] Type checks pass (api + web)
- [ ] Lint/format pass (`bun run lint`)
- [ ] Tests pass (`bun run test`, after `docker compose up -d postgres-test`)
- [ ] Manual browser walkthrough: route → stops → schedule → assignment → status, incl. a conflict error and role-gated buttons
- [ ] Schema reflected in `docs/database.md` (new ERD section)
- [ ] `docs/status.md` and `docs/roadmap.md` updated to reflect v1.1 progress
- [ ] Spec reflects the final implementation
