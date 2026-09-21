# Transportation & Municipal Transit — Design

> Status: Draft
> Implements: [./requirements.md](./requirements.md)

## Overview

v1.1 adds a single backend domain module, `apps/api/src/modules/transportation/`, and a matching frontend feature, `apps/web/src/features/transportation/`. The module manages seven resources — bus routes, bus stops, route stops, vehicles, maintenance records, drivers, and assignments — plus two per-route satellites: the operational status and the active service schedule. It reuses the v1.0 patterns: Elysia plugins with `databasePlugin` + `authMiddleware`, `requireRole` on mutations, Drizzle services typed as `Database`, `computeTotalPages`, and the standard response envelope.

The two integrity rules that cannot be left to "read then write" — driver/vehicle assignment overlap and one-active-schedule-per-route — are enforced by the database (an exclusion constraint and a partial unique index). See [ADR-029](../../docs/adr/ADR-029-driver-identity-and-transportation-domain-modeling.md).

## Architecture

All files live under `apps/api/src/modules/transportation/` (ADR-013: one domain module, grouped by resource). `transportation.routes.ts` composes the resource routers; `app.ts` registers it once.

| File | Responsibility |
| :--- | :--- |
| `apps/api/src/database/schema/transportation.ts` | **New**: `route_status`, `vehicle_status`, `driver_status`, `assignment_status`, `operational_status` enums + `busStops`, `busRoutes`, `routeStops`, `vehicles`, `maintenanceRecords`, `drivers`, `assignments`, `routeStatusUpdates`, `routeSchedules` tables |
| `apps/api/src/database/schema/index.ts` | **Extended**: re-export `./transportation` |
| `apps/api/src/modules/transportation/transportation.routes.ts` | **New**: aggregates the routers below |
| `apps/api/src/modules/transportation/route.routes.ts` / `route.service.ts` | Route CRUD, list/filter |
| `apps/api/src/modules/transportation/stop.routes.ts` / `stop.service.ts` | Stop CRUD, list/search, route-stop reordering |
| `apps/api/src/modules/transportation/vehicle.routes.ts` / `vehicle.service.ts` | Vehicle CRUD, maintenance records, inspection filter |
| `apps/api/src/modules/transportation/driver.routes.ts` / `driver.service.ts` | Driver CRUD, user link |
| `apps/api/src/modules/transportation/assignment.routes.ts` / `assignment.service.ts` | Roster CRUD, overlap validation, cancel/complete |
| `apps/api/src/modules/transportation/schedule.routes.ts` / `schedule.service.ts` | Active service schedule per route (R8) |
| `apps/api/src/modules/transportation/status.routes.ts` / `status.service.ts` | Operational status per route (R7) |
| `apps/api/src/database/seed.ts` | **Extended**: `Transportation` department + demo dataset |
| `apps/web/src/features/transportation/**` | **New**: pages, dialogs, TanStack Query hooks |
| `apps/web/src/layouts/*` | **Extended**: navigation entries for the transit pages |
| `apps/api/src/app.ts` | **Extended**: `.use(transportationRoutes)` |

Each resource router is self-contained and follows the population/announcement ordering: `.use(databasePlugin).use(authMiddleware)`, then read routes, then `.use(requireRole("Officer","Manager","Administrator"))`, then mutation routes. Registration order matters — `authMiddleware` derives with `as: "global"` and `requireRole` guards with `as: "scoped"`, so reads must be declared above the guard.

## API Changes

Base path uses plural nouns (dev standards). `Auth` = `Bearer` unless stated; mutations additionally require Officer/Manager/Administrator.

| Method | Endpoint | Auth | Request | Response | Errors |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/bus-routes` | Bearer | query `page`, `limit`, `search`, `status` | `{ status, data: { items, total, page, limit, totalPages } }` | `401` |
| `GET` | `/api/v1/bus-routes/:id` | Bearer | — | `{ status, data: Route }` | `401` / `404 ROUTE_NOT_FOUND` |
| `POST` | `/api/v1/bus-routes` | Bearer + role | `{ code, name, origin, destination }` | `{ status, data: Route }` | `401` / `403` / `409 ROUTE_CODE_EXISTS` / `422` |
| `PATCH` | `/api/v1/bus-routes/:id` | Bearer + role | partial `{ name?, origin?, destination?, status? }` | `{ status, data: Route }` | `401` / `403` / `404` / `409` / `422` |
| `GET` | `/api/v1/bus-routes/:id/stops` | Bearer | — | `{ status, data: RouteStop[] }` | `401` / `404` |
| `PUT` | `/api/v1/bus-routes/:id/stops` | Bearer + role | `{ stopIds: number[] }` | `{ status, data: RouteStop[] }` | `401` / `403` / `404` / `409 STOP_IN_USE` / `422` |
| `GET` | `/api/v1/bus-routes/:id/status` | Bearer | — | `{ status, data: OperationalStatus }` | `401` / `404` |
| `POST` | `/api/v1/bus-routes/:id/status` | Bearer + role | `{ status, note? }` | `{ status, data: OperationalStatus }` | `401` / `403` / `404` / `422` |
| `GET` | `/api/v1/bus-routes/:id/schedule` | Bearer | — | `{ status, data: Schedule \| null }` | `401` / `404` |
| `PUT` | `/api/v1/bus-routes/:id/schedule` | Bearer + role | `{ operatingDays, firstDeparture, lastDeparture, headwayMinutes }` | `{ status, data: Schedule }` | `401` / `403` / `404` / `422` |
| `DELETE` | `/api/v1/bus-routes/:id/schedule` | Bearer + role | — | `{ status, data: null }` | `401` / `403` / `404` |
| `GET` | `/api/v1/bus-stops` | Bearer | query `page`, `limit`, `search` | paginated `Stop` | `401` |
| `GET` | `/api/v1/bus-stops/:id` | Bearer | — | `{ status, data: Stop }` | `401` / `404 STOP_NOT_FOUND` |
| `POST` | `/api/v1/bus-stops` | Bearer + role | `{ name, latitude, longitude, description? }` | `{ status, data: Stop }` | `401` / `403` / `422` |
| `PATCH` | `/api/v1/bus-stops/:id` | Bearer + role | partial stop | `{ status, data: Stop }` | `401` / `403` / `404` / `422` |
| `DELETE` | `/api/v1/bus-stops/:id` | Bearer + role | — | `{ status, data: null }` | `401` / `403` / `404` / `409 STOP_IN_USE` |
| `GET` | `/api/v1/vehicles` | Bearer | query `page`, `limit`, `status`, `inspectionDue` | paginated `Vehicle` | `401` |
| `GET` | `/api/v1/vehicles/:id` | Bearer | — | `{ status, data: Vehicle }` | `401` / `404 VEHICLE_NOT_FOUND` |
| `POST` | `/api/v1/vehicles` | Bearer + role | `{ plateNumber, model, capacity, manufactureYear? }` | `{ status, data: Vehicle }` | `401` / `403` / `409 VEHICLE_PLATE_EXISTS` / `422` |
| `PATCH` | `/api/v1/vehicles/:id` | Bearer + role | partial vehicle | `{ status, data: Vehicle }` | `401` / `403` / `404` / `409` / `422` |
| `POST` | `/api/v1/vehicles/:id/inspection` | Bearer + role | `{ inspectedAt, nextDueAt? }` | `{ status, data: Vehicle }` | `401` / `403` / `404` / `422` |
| `GET` | `/api/v1/vehicles/:id/maintenance` | Bearer | — | `{ status, data: MaintenanceRecord[] }` | `401` / `404` |
| `POST` | `/api/v1/vehicles/:id/maintenance` | Bearer + role | `{ type, description, performedAt, cost? }` | `{ status, data: MaintenanceRecord }` | `401` / `403` / `404` / `422` |
| `GET` | `/api/v1/drivers` | Bearer | query `page`, `limit`, `search`, `status` | paginated `Driver` | `401` |
| `GET` | `/api/v1/drivers/:id` | Bearer | — | `{ status, data: Driver }` | `401` / `404 DRIVER_NOT_FOUND` |
| `POST` | `/api/v1/drivers` | Bearer + role | `{ fullName, licenseNumber, phone?, userId? }` | `{ status, data: Driver }` | `401` / `403` / `409 DRIVER_LICENSE_EXISTS`, `DRIVER_USER_ALREADY_LINKED` / `422` |
| `PATCH` | `/api/v1/drivers/:id` | Bearer + role | partial driver | `{ status, data: Driver }` | `401` / `403` / `404` / `409` / `422` |
| `GET` | `/api/v1/assignments` | Bearer | query `page`, `limit`, `status`, `driverId`, `vehicleId`, `routeId`, `from`, `to` | paginated `Assignment` | `401` |
| `GET` | `/api/v1/assignments/:id` | Bearer | — | `{ status, data: Assignment }` | `401` / `404 ASSIGNMENT_NOT_FOUND` |
| `POST` | `/api/v1/assignments` | Bearer + role | `{ driverId, vehicleId, routeId, startAt, endAt }` | `{ status, data: Assignment }` | `401` / `403` / `404` / `409 DRIVER_ALREADY_ASSIGNED`, `VEHICLE_ALREADY_ASSIGNED`, `DRIVER_UNAVAILABLE`, `VEHICLE_UNAVAILABLE`, `ROUTE_UNAVAILABLE` / `422` |
| `PATCH` | `/api/v1/assignments/:id` | Bearer + role | partial `{ vehicleId?, routeId?, startAt?, endAt? }` | `{ status, data: Assignment }` | `401` / `403` / `404` / `409...` / `422` |
| `POST` | `/api/v1/assignments/:id/cancel` | Bearer + role | — | `{ status, data: Assignment }` | `401` / `403` / `404` / `400 INVALID_ASSIGNMENT_TRANSITION` |
| `POST` | `/api/v1/assignments/:id/complete` | Bearer + role | — | `{ status, data: Assignment }` | `401` / `403` / `404` / `400 INVALID_ASSIGNMENT_TRANSITION` |

Response payloads: `Route` = `{ id, code, name, origin, destination, status, createdAt, updatedAt }`; `Stop` = `{ id, name, latitude, longitude, description, createdAt, updatedAt }`; `RouteStop` = `{ stopId, name, latitude, longitude, position }`; `Vehicle` = `{ id, plateNumber, model, capacity, manufactureYear, status, lastInspectionAt, nextInspectionDueAt, createdAt, updatedAt }`; `Driver` = `{ id, fullName, licenseNumber, phone, userId, status, createdAt, updatedAt }`; `Assignment` = `{ id, driverId, driverName, vehicleId, plateNumber, routeId, routeCode, startAt, endAt, status, createdAt, updatedAt }`.

## Database Changes

One new migration (`drizzle-kit generate`), plus two hand-written constraint blocks the Drizzle DSL cannot express.

```
route_status       ENUM(active, suspended, retired)
vehicle_status     ENUM(active, maintenance, retired)
driver_status      ENUM(active, inactive)
assignment_status  ENUM(scheduled, completed, cancelled)
operational_status ENUM(on_time, delayed, maintenance)
```

| Table | Key columns & constraints |
| :--- | :--- |
| `bus_routes` | `code` UNIQUE; `status route_status` default `active`; `created_at`, `updated_at` |
| `bus_stops` | `name`; `latitude numeric(9,6)`, `longitude numeric(9,6)`; `description`; index on `name` |
| `route_stops` | `route_id` FK → `bus_routes` ON DELETE CASCADE; `stop_id` FK → `bus_stops`; `position integer`; UNIQUE `(route_id, position)`, UNIQUE `(route_id, stop_id)` |
| `vehicles` | `plate_number` UNIQUE; `capacity integer` (> 0, CHECK); `status vehicle_status`; `last_inspection_at date`, `next_inspection_due_at date`; index on `status` |
| `maintenance_records` | `vehicle_id` FK; `type`, `description`, `performed_at date`, `cost numeric(12,2)`; `recorded_by_id` FK → `users`; index on `(vehicle_id, performed_at)` |
| `drivers` | `license_number` UNIQUE; `phone`; `user_id` FK → `users` UNIQUE (nullable); `status driver_status`; index on `status` |
| `assignments` | `driver_id` FK, `vehicle_id` FK, `route_id` FK; `start_at`, `end_at timestamptz`; `status assignment_status` default `scheduled`; `created_by_id` FK → `users`; indexes on `(driver_id, start_at, end_at)`, `(vehicle_id, start_at, end_at)` |
| `route_status_updates` | `route_id` FK; `status operational_status`; `note`; `reported_by_id` FK → `users`; `created_at`; index on `(route_id, created_at desc)` — current status is the newest row |
| `route_schedules` | `route_id` FK; `operating_days integer[]`; `first_departure time`, `last_departure time`; `headway_minutes integer`; `active boolean` default `true`; `updated_at` |

Hand-written migration SQL (added after generation):

```sql
-- Assignment integrity: no overlapping active duty for the same driver/vehicle.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "assignments"
  ADD CONSTRAINT "assignments_driver_no_overlap"
  EXCLUDE USING gist (
    "driver_id" WITH =,
    tstzrange("start_at", "end_at", '[)') WITH &&
  ) WHERE ("status" = 'scheduled');

ALTER TABLE "assignments"
  ADD CONSTRAINT "assignments_vehicle_no_overlap"
  EXCLUDE USING gist (
    "vehicle_id" WITH =,
    tstzrange("start_at", "end_at", '[)') WITH &&
  ) WHERE ("status" = 'scheduled');

-- At most one active schedule per route (R8.4).
CREATE UNIQUE INDEX "route_schedules_one_active"
  ON "route_schedules" ("route_id") WHERE "active";
```

`tstzrange(..., '[)')` makes adjacent assignments (`end_at == next start_at`) non-overlapping. Cancelled/completed assignments are excluded by the `WHERE` predicate, so they never block a new booking. Constraint violations surface as Postgres error `23P01` (`exclusion_violation`); the route layer maps them to the `409` codes in the table above.

Deployment note: `btree_gist` is a contrib extension shipped with the `postgres:18-alpine` image; `CREATE EXTENSION` requires the database owner — the migration runs as `civicos_userdb`, which owns the database. Production (`ADR-027`) uses the same image.

## Data Flow

Assignment creation (the concurrency-sensitive path):

1. `POST /api/v1/assignments` → Elysia validates the body shape (`t.Object`).
2. `requireRole` confirms Officer/Manager/Administrator.
3. `AssignmentService.create` opens a transaction and loads the referenced driver, vehicle, and route to check availability flags.
4. Insert into `assignments`; the exclusion constraints reject an overlap atomically even under concurrent requests.
5. On success, return the joined `Assignment`; on `23P01`, return the matching `409`.

All other resources are simple validate → guard → service → join → envelope.

## Frontend Behavior

New feature directory `apps/web/src/features/transportation/` with one hook module (`use-transit.ts`) exposing `useRoutes`, `useStops`, `useVehicles`, `useDrivers`, `useAssignments`, and per-resource mutations that invalidate their list keys (ADR-025 pattern). Shared options come from `lib/use-options.ts` (extended with `useRouteOptions`, `useDriverOptions`, `useVehicleOptions`).

Pages:

- `routes-page.tsx` — filterable, paginated table (code, name, origin → destination, status badge, actions); dialog for create/edit.
- `route-detail-page.tsx` — tabs for **Stops** (ordered list with reorder; inline create/attach stop so no standalone stops page is needed), **Status** (current + change form), **Schedule** (active schedule form + deactivate).
- `vehicles-page.tsx` — filterable table (plate, model, capacity, status, inspection due badge); record-inspection dialog. *(stretch)* maintenance history drawer.
- `drivers-page.tsx` — filterable table (name, license, phone, linked user, status).
- `assignments-page.tsx` — duty roster table (driver, vehicle, route, period, status) with create/edit/cancel/complete.

States per list: Mantine `Skeleton` while loading, empty-state text, `Alert` on error. Status badges follow the design tokens: `active`/`on_time` = green, `maintenance`/`delayed` = yellow, `retired`/`inactive`/`suspended` = gray. Mutations surface API `error.message` (the pattern already used in the user/announcement dialogs).

Navigation: a "Transportation" group in the app shell listing Routes, Stops, Vehicles, Drivers, Roster — hidden behind `usePermissions().can(...)` only if/when roles diverge (v1.0 keeps the menu visible to all authenticated users, per ADR-024 §5).

## Backend Behavior

- Services are classes with `static` methods, typed `db: Database`, selecting explicit column objects (never `select *`), following `PopulationService`/`AnnouncementService`.
- List services use `and(...)` with optional filters, `Promise.all([items, count])`, and `computeTotalPages`.
- `RouteService.update` rejects leaving the `retired` state (`400 ROUTE_STATUS_LOCKED`); `VehicleService` likewise.
- `StopService.replaceRouteStops` runs in a transaction: delete existing `route_stops` for the route, re-insert with positions `0..n-1`; duplicate `stopIds` in the payload → `422`. `StopService.remove` checks `route_stops` for the stop first and returns `409 STOP_IN_USE` instead of deleting.
- `VehicleService.recordInspection` sets `lastInspectionAt` and `nextInspectionDueAt` (defaulting the latter to `inspectedAt` + 12 months) in one update.
- `AssignmentService` may only mutate rows whose `status` is `scheduled`; any other source status → `400 INVALID_ASSIGNMENT_TRANSITION`.
- `AssignmentService` holds a pure `assertNoOverlap` / `rangesOverlap(startA, endA, startB, endB)` helper (unit-testable without a DB, mirroring `AnnouncementService.assertTransition`), used for pre-checks and messages; the DB constraint is the source of truth.
- `StatusService.current(routeId)` returns the newest `route_status_updates` row; `ScheduleService.upsert` deactivates the previous active row and inserts/updates the new one in a transaction, leaving the partial unique index to arbitrate.
- `operatingDays` is stored as ISO weekday integers `1..7`; validation requires a non-empty, duplicate-free subset.

## Authentication & Authorization

- Reads: any authenticated user (Bearer), matching ADR-024 §5.
- Mutations: `.use(requireRole("Officer", "Manager", "Administrator"))` per resource router.
- New role distinctions are **not** introduced for v1.1; `Mayor` remains read-only. Department scoping stays Future Work.
- Audit fields (`created_by_id`, `reported_by_id`, `recorded_by_id`) come from the authenticated token only — never from the body.

## Error Handling

| Code | HTTP | When |
| :--- | :--- | :--- |
| `VALIDATION` | 422 | DTO validation failure (global handler) |
| `EMPTY_UPDATE` | 400 | PATCH with no fields |
| `ROUTE_NOT_FOUND` / `STOP_NOT_FOUND` / `VEHICLE_NOT_FOUND` / `DRIVER_NOT_FOUND` / `ASSIGNMENT_NOT_FOUND` | 404 | Unknown `:id` |
| `ROUTE_CODE_EXISTS` / `VEHICLE_PLATE_EXISTS` / `DRIVER_LICENSE_EXISTS` / `DRIVER_USER_ALREADY_LINKED` | 409 | Unique violation (`23505`) |
| `DRIVER_ALREADY_ASSIGNED` / `VEHICLE_ALREADY_ASSIGNED` | 409 | Exclusion violation (`23P01`) |
| `DRIVER_UNAVAILABLE` / `VEHICLE_UNAVAILABLE` / `ROUTE_UNAVAILABLE` | 409 | Referenced entity not assignable (status) |
| `STOP_IN_USE` | 409 | Detach/removal blocked by existing route attachment |
| `ROUTE_STATUS_LOCKED` | 400 | Attempt to leave the terminal `retired` state |
| `INVALID_ASSIGNMENT_TRANSITION` | 400 | Cancel/complete from a non-`scheduled` status |
| `UNAUTHORIZED` / `FORBIDDEN` | 401 / 403 | Middleware / role guard |

Helpers: `isUniqueViolation` exists (`apps/api/src/app/utils/unique-violation.ts`); add `isExclusionViolation` (code `23P01`, same `.cause` fallback) alongside it. Because a single insert may violate either the driver or vehicle constraint, the service pre-checks availability and inspects `constraint` in the error to choose the code. Unknown foreign keys on write are resolved before insert and reported with the specific `*_NOT_FOUND` `404` codes (R6.10), not a generic error.

## Security Considerations

- RBAC enforced server-side; the UI never decides access (ADR-024).
- Assignments reference `drivers.id` / `vehicles.id` / `bus_routes.id`; no client-supplied audit fields.
- Coordinates and integer fields validated at the trust boundary (lat/lng ranges, positive capacity/headway, `endAt > startAt`).
- Driver `phone` is personal data: returned to authenticated staff only, never logged.
- No hard deletes; retirement/deactivation/cancellation preserve history (ADR-020, NFR4).

## Testing Strategy

- **Unit** (no DB): `rangesOverlap` / `assertNoOverlap`, schedule `operatingDays` validation, terminal-status transition guards, `computeTotalPages` already covered.
- **API** (`apps/api/src/test/api/transportation.test.ts`, in-process `app.handle()` per ADR-026): CRUD happy paths, RBAC `403`, `404`s, `422` validation, unique conflicts `409`, assignment overlap `409` (including adjacent-boundary success), schedule one-active invariant, status history ordering.
- **Component**: dialog validation and list empty/loading/error states for at least Routes and Assignments.
- **E2E/Manual**: full route → stops → schedule → assignment flow in the browser; verify conflict error messaging.

## Open Questions

- **Exclusion constraint vs service-only check**: the design chooses the DB constraint for atomicity (NFR6). If `btree_gist` is unwanted in a target environment, fall back to a serializable transaction with a `SELECT ... FOR UPDATE` on the driver/vehicle row — same guarantee, more code.
- **Stop management surface**: stops are created/attached inline from the route detail; `/bus-stops` stays a read-only directory (`GET`) used by the stop picker. A standalone stop-management page is intentionally not built (L1).
- **`operatingDays` storage**: `integer[]` of ISO weekdays vs a normalized `route_schedule_days` table. Array is simpler; normalization is available if per-day departure times arrive (Future Work).
- **Demo seed dataset**: whether to seed realistic routes/stops/vehicles/drivers for portfolio demonstration. Assumed yes, kept idempotent.
- **`btree_gist` availability**: verify `CREATE EXTENSION IF NOT EXISTS btree_gist` succeeds when the drizzle migrator runs as the test DB user (`civicos`) and the dev user (`civicos_userdb`) before relying on it; otherwise use the transactional `SELECT ... FOR UPDATE` fallback above.
