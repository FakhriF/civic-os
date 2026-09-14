# 👤 Module Specification: User Management

> **Module Name**: `user`  
> **Backend Path**: `apps/api/src/modules/user`  
> **Frontend Path**: `apps/web/src/features/users`  
> 📄 **Detailed feature specification**: [`specs/user-management/`](../../specs/user-management/) (requirements, design, tasks)

---

## 📌 Functional Requirements

1. **Employee Directory**: List municipal accounts with full name, email, role, department, and active status.
2. **Account Provisioning**: Administrators create accounts with email, full name, password, role, and department.
3. **Profile & Role Updates**: Administrators update name, role, department, and optionally reset the password.
4. **Deactivation (Soft Delete)**: Toggle `isActive` instead of deleting a row (ADR-020); an Administrator cannot deactivate their own account.

---

## 🔌 API Contracts

| Method  | Endpoint             | Access Level  | Description                                                   |
| :------ | :------------------- | :------------ | :------------------------------------------------------------ |
| `GET`   | `/api/v1/users`      | Authenticated | Directory with resolved role and department names             |
| `POST`  | `/api/v1/users`      | Administrator | Create an account (password stored as an argon2id hash)       |
| `PATCH` | `/api/v1/users/:id`  | Administrator | Update name, role, department, password, or `isActive`        |

The form's select inputs are populated from the lookup endpoints `GET /api/v1/roles` and `GET /api/v1/departments`, which are readable by any authenticated user.

### Authorization

- The directory is readable by any authenticated user; **every mutation is `Administrator`-only**, enforced server-side by the `requireRole` guard (ADR-024).
- The web app hides Administrator-only actions (create, edit, deactivate) from other roles using the `roleName` delivered in the auth payload. This is UX polish and never the security boundary — a non-Administrator calling the API directly still receives `403 FORBIDDEN`.

### Error Codes

- `409 EMAIL_EXISTS` — the email is already in use.
- `404 USER_NOT_FOUND` — unknown user id.
- `400 SELF_DEACTIVATION` — an Administrator attempted to deactivate their own account.
- `400 EMPTY_UPDATE` — a `PATCH` was sent with no fields.
