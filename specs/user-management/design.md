# User Management — Design

> Status: Draft
> Implements: [./requirements.md](./requirements.md)

## Overview

A new `user` module on the backend (ADR-013) exposes the directory and admin-only mutations, guarded by a `requireRole` check built on the existing `authMiddleware` user. The frontend adds a `features/users` directory with a Mantine table and a create/edit dialog, using TanStack Query mutations that invalidate the list on success.

## Architecture

| File                                                   | Responsibility                                                   |
| :----------------------------------------------------- | :--------------------------------------------------------------- |
| `apps/api/src/modules/user/user.routes.ts`             | Directory + CRUD routes, `requireRole` guard                     |
| `apps/api/src/modules/user/user.service.ts`            | Password hashing, duplicate-email handling, user payload mapping |
| `apps/api/src/modules/role/role.routes.ts`             | `GET /api/v1/roles` (form options)                               |
| `apps/api/src/modules/department/department.routes.ts` | `GET /api/v1/departments` (form options)                         |
| `apps/web/src/features/users/users-page.tsx`           | Directory table                                                  |
| `apps/web/src/features/users/user-form-dialog.tsx`     | Create/edit modal                                                |
| `apps/web/src/features/users/use-users.ts`             | TanStack Query: list query + create/update/deactivate mutations  |

## API Changes

| Method  | Endpoint              | Auth           | Request                                                               | Response                         | Errors                                                          |
| :------ | :-------------------- | :------------- | :-------------------------------------------------------------------- | :------------------------------- | :-------------------------------------------------------------- |
| `GET`   | `/api/v1/users`       | Bearer         | —                                                                     | `{ status, data: User[] }`       | `401 UNAUTHORIZED`                                              |
| `POST`  | `/api/v1/users`       | Bearer + Admin | `{ email, fullName, password, roleId, departmentId }`                 | `{ status, data: User }`         | `401` / `403 FORBIDDEN` / `409 EMAIL_EXISTS` / `422` validation |
| `PATCH` | `/api/v1/users/:id`   | Bearer + Admin | partial `{ fullName?, password?, roleId?, departmentId?, isActive? }` | `{ status, data: User }`         | `401` / `403` / `404 USER_NOT_FOUND` / `422`                    |
| `GET`   | `/api/v1/roles`       | Bearer         | —                                                                     | `{ status, data: Role[] }`       | `401`                                                           |
| `GET`   | `/api/v1/departments` | Bearer         | —                                                                     | `{ status, data: Department[] }` | `401`                                                           |

`User` payload: `{ id, email, fullName, roleId, roleName, departmentId, departmentName, isActive, createdAt }`.

## Authorization: `requireRole` Guard

Built on the existing `authMiddleware` (which derives `user` with `roleId`):

```ts
const requireRole = (roleName: string) =>
  new Elysia({ name: "require-role" })
    .use(databasePlugin)
    .use(authMiddleware)
    // as: "scoped" — the default 'local' hook scope would not reach the
    // parent routes registered after .use(requireRole(...))
    .onBeforeHandle({ as: "scoped" }, async ({ db, user, set }) => {
      const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.name, roleName))
        .limit(1);

      if (!user || !role || user.roleId !== role.id) {
        set.status = 403;
        return {
          status: "error",
          error: { code: "FORBIDDEN", message: "Forbidden." },
        };
      }
    });
```

Applied to the mutation routes: `.use(requireRole("Administrator"))`. The role is looked up by name (not hardcoded id) so the seeded roles stay the single source of truth. The directory routes use only `authMiddleware`.

## Database Changes

- No schema changes — reuses `users`, `roles`, `departments` (see `docs/database.md`).
- Directory list joins `roles` and `departments` to include names.
- Duplicate email is handled by catching the unique-constraint violation from the `users.email` unique index — note that Drizzle wraps driver errors in `DrizzleQueryError`, so the pg code `23505` must be read from `err.cause.code`.

## Frontend Behavior

- `users-page.tsx`: Mantine `Table` with columns (name, email, role, department, status badge, actions). Status badge uses design tokens: green for active, red/gray for inactive.
- `user-form-dialog.tsx`: `Modal` + controlled form (`TextInput` email/fullName, `PasswordInput` password, `Select` role/department populated from `GET /roles` + `GET /departments`). Used for both create and edit.
- `use-users.ts`: `useQuery(["users"])` for the list; `useMutation` for create/update/deactivate with `queryClient.invalidateQueries({ queryKey: ["users"] })` on success.
- Deactivate action shows a confirmation step; the "Deactivate" action is hidden for the current user's own row (R4.2).
- Empty list renders an empty state row (R1 edge case).

## Error Handling

| Code             | HTTP | When                               |
| :--------------- | :--- | :--------------------------------- |
| `UNAUTHORIZED`   | 401  | Missing/invalid token (middleware) |
| `FORBIDDEN`      | 403  | Non-Administrator tries a mutation |
| `EMAIL_EXISTS`   | 409  | Duplicate email on create          |
| `USER_NOT_FOUND` | 404  | Unknown `:id` on update            |
| Validation       | 422  | DTO validation failure             |

## Security Considerations

- Passwords hashed with `Bun.password.hash` (argon2id).
- Mutations are admin-only, enforced server-side (R5.3).
- Self-deactivation guard: `PATCH` that sets `isActive: false` on the caller's own id is rejected.
- No hard delete; deactivation only (ADR-020).

## Testing Strategy

- Unit: `user.service` password hashing + payload mapping.
- API tests: directory (401/200), create (success, duplicate email → 409, non-admin → 403), update (404, 403), deactivate (+self-deactivation guard).
- Component: form dialog validation states.

## Open Questions

- Pagination/search: deferred — revisit when the directory grows (roadmap M5 scope is the basic directory).
