# Population Registry — Design

> Status: Draft
> Implements: [./requirements.md](./requirements.md)

## Overview

A `population` module on the backend exposes the paginated, searchable citizen registry with create/update guarded by a multi-role `requireRole`. The frontend adds a `features/population` directory with a searchable, paginated table and a create/edit dialog, reusing the patterns established in M5 (TanStack Query mutations, form dialog, `requireRole`).

## Architecture

| File                                                       | Responsibility                                                         |
| :--------------------------------------------------------- | :--------------------------------------------------------------------- |
| `apps/api/src/app/middleware/require-role.ts`              | **Moved & extended** shared `requireRole(...roles)` guard (multi-role) |
| `apps/api/src/modules/population/population.routes.ts`     | Registry routes + guards                                               |
| `apps/api/src/modules/population/population.service.ts`    | Paginated list, findById, create/update, unique-violation handling     |
| `apps/web/src/features/population/population-page.tsx`     | Searchable, paginated table                                            |
| `apps/web/src/features/population/citizen-form-dialog.tsx` | Create/edit modal                                                      |
| `apps/web/src/features/population/use-citizens.ts`         | TanStack Query: list query + create/update mutations                   |

## Authorization: Multi-Role `requireRole`

The guard from ADR-024 moves to `apps/api/src/app/middleware/require-role.ts` and extends to accept multiple roles:

```ts
export const requireRole = (...roleNames: string[]) =>
  new Elysia({ name: "require-role" })
    .use(databasePlugin)
    .use(authMiddleware)
    // as: "scoped" — the default 'local' scope would not reach parent routes (ADR-024)
    .onBeforeHandle({ as: "scoped" }, async ({ db, user, set }) => {
      if (!user) {
        set.status = 403;
        return {
          status: "error",
          error: { code: "FORBIDDEN", message: "Forbidden." },
        };
      }

      const allowed = await db
        .select({ id: roles.id })
        .from(roles)
        .where(inArray(roles.name, roleNames));

      if (!allowed.some((role) => role.id === user.roleId)) {
        set.status = 403;
        return {
          status: "error",
          error: { code: "FORBIDDEN", message: "Forbidden." },
        };
      }
    });
```

Usage: `.use(requireRole("Officer", "Manager", "Administrator"))` on mutation routes; the list/detail routes use only `authMiddleware`. The user module (`modules/user/user.routes.ts`) switches to the shared import with `requireRole("Administrator")`.

## API Changes

| Method  | Endpoint               | Auth                           | Request                                                             | Response                                                      | Errors                                                  |
| :------ | :--------------------- | :----------------------------- | :------------------------------------------------------------------ | :------------------------------------------------------------ | :------------------------------------------------------ |
| `GET`   | `/api/v1/citizens`     | Bearer                         | query `page`, `limit`, `search`, `gender`                           | `{ status, data: { items, total, page, limit, totalPages } }` | `401`                                                   |
| `GET`   | `/api/v1/citizens/:id` | Bearer                         | —                                                                   | `{ status, data: Citizen }`                                   | `401` / `404 CITIZEN_NOT_FOUND`                         |
| `POST`  | `/api/v1/citizens`     | Bearer + Officer/Manager/Admin | `{ nationalId, fullName, gender, birthDate, address, occupation }`  | `{ status, data: Citizen }`                                   | `401` / `403` / `409 CITIZEN_EXISTS` / `422 VALIDATION` |
| `PATCH` | `/api/v1/citizens/:id` | Bearer + Officer/Manager/Admin | partial `{ fullName?, gender?, birthDate?, address?, occupation? }` | `{ status, data: Citizen }`                                   | `401` / `403` / `404` / `422`                           |

`Citizen` payload: `{ id, nationalId, fullName, gender, birthDate, address, occupation, createdById, updatedById, createdAt, updatedAt }`.

## Pagination & Search

- `limit` clamped to `[1, 50]` (default 10), `page` defaults to 1.
- Query: `select ... where (search ? ilike(nationalId, %term%) or ilike(fullName, %term%)) and (gender ? eq)` + `limit/offset`; a parallel `count()` query with the same where clause yields `total`.
- `totalPages = Math.max(1, Math.ceil(total / limit))`.

## Frontend Behavior

- `population-page.tsx`: `TextInput` search + `Select` gender + Mantine `Table` (columns: NIK, name, gender, birth date, occupation, actions) + Mantine `Pagination` bound to `page`/`totalPages`.
- Search input uses `useDebouncedValue` from `@mantine/hooks` (300ms) so the query only fires after the user pauses typing.
- `use-citizens.ts`: `useQuery({ queryKey: ["citizens", { page, limit, search, gender }], ... })` — params in the key so every filter change refetches; `useCreateCitizen` / `useUpdateCitizen` invalidate `["citizens"]`.
- `citizen-form-dialog.tsx`: same modal pattern as M5 — National ID disabled in edit mode (R4.1), `Select` for gender, `DateInput` (Mantine) for birth date.

## Error Handling

| Code                | HTTP | When                               |
| :------------------ | :--- | :--------------------------------- |
| `UNAUTHORIZED`      | 401  | Missing/invalid token (middleware) |
| `FORBIDDEN`         | 403  | Role not allowed for the mutation  |
| `CITIZEN_EXISTS`    | 409  | Duplicate National ID              |
| `CITIZEN_NOT_FOUND` | 404  | Unknown `:id`                      |
| `VALIDATION`        | 422  | DTO validation failure             |

## Security Considerations

- Audit fields (`createdById`, `updatedById`) come from the authenticated token only (R5.3).
- National ID treated as identity: unique, immutable after creation.
- Mutations guarded by multi-role `requireRole` server-side.

## Testing Strategy

- Unit: `population.service` pagination math + payload mapping.
- API tests: list pagination/search/filter, create (success, duplicate NIK → 409, forbidden role → 403), update (404, NIK immutable).
- Component: dialog validation + debounced search.

## Open Questions

- Deletion policy: no delete by design (registry permanence — see requirements, Out of Scope). If mistaken registrations become a real need, a soft-void flow (`isVoided` + `voidedById`/`voidedAt`, filtered from the list) is the preferred path over hard delete; deferred until needed.
- NIK auto-suggest and CSV import are deferred (Out of Scope).
