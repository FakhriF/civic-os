# Transportation & Municipal Transit — Requirements

> Status: Draft
> Related roadmap milestone: v1.1 — Transportation & Municipal Transit
> Owner: CivicOS team

## Overview

CivicOS v1.1 adds administrative management of the municipal public-transit network: bus routes and their ordered stops, the vehicle fleet and its inspections, driver profiles and duty assignments, and the operational status of each route. It replaces spreadsheets and paper logs with one internal system of record for the Transportation department.

This is an internal administrative tool. It records what the network is and who is serving it; it does not track vehicles in real time, sell fares, or expose transit data to the public.

The Transportation department is provisioned in the seed data alongside the existing departments. A **driver is a dedicated `drivers` record**, separate from `users` (login/security), with an optional link to a user account — see [ADR-029](../../docs/adr/ADR-029-driver-identity-and-transportation-domain-modeling.md).

## Functional Requirements

### R1 — Bus Route Management

The system SHALL allow Officer, Manager, and Administrator roles to create, view, and update bus routes, and to retire them via a status change.

#### Acceptance Criteria

- R1.1 Any authenticated user can list and view routes.
- R1.2 The list is paginated and filterable by `status` and free-text search over route `code` and `name`.
- R1.3 A route has a unique `code` (e.g. `R-01`), a `name`, an `origin`, a `destination`, and a `status` of `active` | `suspended` | `retired`.
- R1.4 Creating a route requires `code`, `name`, `origin`, and `destination`.
- R1.5 Retiring a route is a status change; routes are never hard-deleted.
- R1.6 A duplicate `code` returns `409 ROUTE_CODE_EXISTS`.
- R1.7 An unknown id returns `404 ROUTE_NOT_FOUND`.
- R1.8 `retired` is terminal; any attempt to change or un-retire a `retired` route returns `400 ROUTE_STATUS_LOCKED`.

#### Edge Cases

- A route may be created before any stops are attached.
- A `retired` or `suspended` route cannot receive new driver assignments (see R6).

### R2 — Bus Stops & Route Stops

The system SHALL manage a city-wide bus-stop directory and the ordered sequence of stops attached to each route.

#### Acceptance Criteria

- R2.1 Any authenticated user can list and view stops.
- R2.2 A stop has a `name`, a `latitude`, and a `longitude`; `description` is optional.
- R2.3 Stops are reusable across routes (one directory, many route attachments).
- R2.4 A stop can be attached to a route with a sequence position; the position is unique within that route.
- R2.5 Reordering a route's stops updates positions without losing attachments.
- R2.6 A stop MAY be deleted only while attached to no route; deleting an attached stop returns `409 STOP_IN_USE`. Removing a stop from a route is done by replacing that route's stop list (R2.5).
- R2.7 `latitude` outside `[-90, 90]` or `longitude` outside `[-180, 180]` returns `422 VALIDATION`.
- R2.8 An unknown stop or route id returns `404 STOP_NOT_FOUND` / `ROUTE_NOT_FOUND`.

#### Edge Cases

- The same stop MAY appear on many routes.
- The same stop MAY NOT appear twice on one route.
- A route's stop list may be empty.

### R3 — Fleet Vehicle Inventory

The system SHALL allow Officer, Manager, and Administrator roles to manage the vehicle fleet.

#### Acceptance Criteria

- R3.1 Any authenticated user can list and view vehicles.
- R3.2 The list is paginated and filterable by `status`.
- R3.3 A vehicle has a unique `plateNumber`, a `model`, a `capacity`, an optional `manufactureYear`, and a `status` of `active` | `maintenance` | `retired`.
- R3.4 Creating a vehicle requires `plateNumber`, `model`, and `capacity`.
- R3.5 `capacity` MUST be a positive integer.
- R3.6 A duplicate `plateNumber` returns `409 VEHICLE_PLATE_EXISTS`.
- R3.7 Retiring a vehicle is a status change; vehicles are never hard-deleted.
- R3.8 An unknown id returns `404 VEHICLE_NOT_FOUND`.

#### Edge Cases

- A `maintenance` vehicle cannot receive new driver assignments (see R6).

### R4 — Fleet Maintenance & Inspection

The system SHALL record maintenance history and inspection status for each vehicle.

#### Acceptance Criteria

- R4.1 Officer, Manager, and Administrator roles can create a maintenance record for a vehicle.
- R4.2 A maintenance record has a `type`, a `description`, a `performedAt` date, an optional `cost`, and the recording user.
- R4.3 A maintenance record requires `type`, `description`, and `performedAt`.
- R4.4 Officer, Manager, and Administrator roles can record an inspection with an `inspectedAt` date and an optional `nextDueAt` date; when `nextDueAt` is omitted it defaults to `inspectedAt` plus 12 months.
- R4.5 Recording an inspection updates the vehicle's latest inspection date and next inspection due date.
- R4.6 A vehicle exposes its latest inspection date and the next inspection due date.
- R4.7 Recording a maintenance record MAY set the vehicle status to `maintenance`; clearing it back to `active` is an explicit status change.
- R4.8 The vehicle list can filter vehicles whose inspection is due or overdue.
- R4.9 An unknown vehicle id returns `404 VEHICLE_NOT_FOUND`.

#### Edge Cases

- A vehicle with no inspection recorded is treated as due for inspection.
- Past maintenance records are immutable; corrections are new records.

### R5 — Driver Directory

The system SHALL maintain a directory of transit drivers as records separate from user accounts.

#### Acceptance Criteria

- R5.1 Any authenticated user can list and view drivers.
- R5.2 Officer, Manager, and Administrator roles can create and update drivers.
- R5.3 A driver has a `fullName`, a unique `licenseNumber`, an optional `phone`, a `status` of `active` | `inactive`, and an optional `userId` link to a user account.
- R5.4 Creating a driver requires `fullName` and `licenseNumber`.
- R5.5 A duplicate `licenseNumber` returns `409 DRIVER_LICENSE_EXISTS`.
- R5.6 Deactivating a driver is a status change; drivers are never hard-deleted.
- R5.7 An unknown driver id returns `404 DRIVER_NOT_FOUND`.

#### Edge Cases

- A driver without a linked `userId` cannot sign in but can be assigned to duties.
- A linked `userId` MUST reference an existing user; a `userId` already linked to another driver returns `409 DRIVER_USER_ALREADY_LINKED`.
- An `inactive` driver cannot receive new assignments (see R6).

### R6 — Driver Assignments (Duty Roster)

The system SHALL assign a driver to a vehicle and route for a bounded duty period.

#### Acceptance Criteria

- R6.1 Any authenticated user can view the roster.
- R6.2 Officer, Manager, and Administrator roles can create, update, and cancel assignments.
- R6.3 An assignment references a driver, a vehicle, a route, a `startAt`, an `endAt`, and a `status` of `scheduled` | `completed` | `cancelled`.
- R6.4 `endAt` MUST be later than `startAt`.
- R6.5 A driver already assigned to another active assignment whose period overlaps returns `409 DRIVER_ALREADY_ASSIGNED`.
- R6.6 A vehicle already assigned to another active assignment whose period overlaps returns `409 VEHICLE_ALREADY_ASSIGNED`.
- R6.7 Assigning an `inactive` driver returns `409 DRIVER_UNAVAILABLE`.
- R6.8 Assigning a `retired` or `suspended` route, or a `maintenance` or `retired` vehicle, returns `409 ROUTE_UNAVAILABLE` / `409 VEHICLE_UNAVAILABLE`.
- R6.9 An unknown assignment id returns `404 ASSIGNMENT_NOT_FOUND`.
- R6.10 Referencing an unknown driver, vehicle, or route returns `404 DRIVER_NOT_FOUND` / `VEHICLE_NOT_FOUND` / `ROUTE_NOT_FOUND`.
- R6.11 Only an assignment in `scheduled` status can be updated, cancelled, or completed; any other source status returns `400 INVALID_ASSIGNMENT_TRANSITION`.

#### Edge Cases

- Adjacent assignments (`endAt` == next `startAt`) do not overlap.
- Cancelling an assignment frees the driver and vehicle for the same period.

### R7 — Route Operational Status

The system SHALL expose the current operational status of each route to authenticated users.

#### Acceptance Criteria

- R7.1 Officer, Manager, and Administrator roles can set a route's operational status to `on_time` | `delayed` | `maintenance`.
- R7.2 A status change accepts an optional `note` and records the acting user and timestamp.
- R7.3 Any authenticated user can read the current status.
- R7.4 An invalid status value returns `422 VALIDATION`.
- R7.5 An unknown route id returns `404 ROUTE_NOT_FOUND`.

#### Edge Cases

- Operational status is manual; it is independent of the route's `active`/`suspended`/`retired` lifecycle status.
- The most recent status change wins; history is retained for audit.

### R8 — Route Service Schedule (Active Schedule)

The system SHALL record the active operating schedule of a route.

#### Acceptance Criteria

- R8.1 Officer, Manager, and Administrator roles can set a route's schedule.
- R8.2 A schedule has `operatingDays` (a non-empty subset of weekdays), a `firstDeparture` time, a `lastDeparture` time, a `headwayMinutes`, and an `active` flag.
- R8.3 `headwayMinutes` MUST be a positive integer.
- R8.4 At most one schedule per route is `active`; activating one deactivates the previous schedule.
- R8.5 Any authenticated user can read a route's active schedule.
- R8.6 An unknown route id returns `404 ROUTE_NOT_FOUND`.
- R8.7 The active schedule can be deactivated; a route may then have no active schedule.

#### Edge Cases

- A `lastDeparture` earlier than `firstDeparture` denotes an overnight service span.
- A route may temporarily have no active schedule.

## Non-Functional Requirements

- NFR1 All responses follow the CivicOS API contract: `{ status, data }` on success and `{ status, error: { code, message } }` on failure.
- NFR2 Validation failures return `422` with code `VALIDATION`.
- NFR3 Primary list endpoints paginate with default `limit` 10, maximum 50, and default `page` 1, returning `items`, `total`, `page`, `limit`, and `totalPages`. Small child collections (a route's stops, a vehicle's maintenance records) are returned in full.
- NFR4 No hard deletes. Routes and vehicles are retired, drivers deactivated, assignments cancelled, and stop attachments removed — following the ADR-020 soft-delete philosophy.
- NFR5 Mutable records carry `createdAt` / `updatedAt`; records that change state (maintenance, inspection, assignment, operational status) also carry the acting user for audit.
- NFR6 Data that must stay consistent (assignment overlaps, one active schedule per route) is enforced atomically, not only in application code.
- NFR7 All user-facing strings and comments are in English.

## Out of Scope

- GPS or live vehicle tracking, and interactive maps (deferred to v2.0).
- Route geometry / polylines; only stop coordinates are stored.
- Passenger counting, fare collection, ticketing, or revenue.
- Automatic schedule generation, headway optimization, or timetable per stop.
- Notifications or alerts to drivers, staff, or the public.
- Public / citizen-facing transit information or service requests.
- Real-time push or WebSocket status feeds; status is polled and manually maintained.
- Driver licensing, HR records, or payroll.

## Future Work

- **Department-based authorization**: restrict management to members of the Transportation department (current RBAC is role-based; see backlog).
- **Per-stop timetable**: departure times per stop, as an extension of R8.
- **Map visualization** of routes and stops (v2.0 Interactive Map Integration).
- **Driver HR integration**: license expiry tracking and contact details beyond R5.
- **Vehicle–route compatibility rules** (e.g. capacity or accessibility constraints).
