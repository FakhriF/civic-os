# 📢 Module Specification: Announcements

> **Module Name**: `announcement`  
> **Backend Path**: `apps/api/src/modules/announcement`  
> **Frontend Path**: `apps/web/src/features/announcement`

---

## 📌 Functional Requirements

1. **Bulletin Authoring**: Create and edit municipal announcements (title, plain-text content, sponsoring department).
2. **Publishing Workflow**: Manage status transitions (`draft` ➔ `published` ➔ `archived`), with republish from `archived`.
3. **Department Tagging**: Associate bulletins with sponsoring departments (e.g. Public Relations, Transportation).

---

## 🔌 API Contracts

| Method  | Endpoint                            | Access Level  | Description                                           |
| :------ | :---------------------------------- | :------------ | :---------------------------------------------------- |
| `GET`   | `/api/v1/announcements`             | Authenticated | Paginated list with `status` / `departmentId` filters |
| `GET`   | `/api/v1/announcements/:id`         | Authenticated | Retrieve a single announcement                        |
| `POST`  | `/api/v1/announcements`             | Officer+      | Create a new announcement as `draft`                  |
| `PATCH` | `/api/v1/announcements/:id`         | Officer+      | Update title, content, or department                  |
| `POST`  | `/api/v1/announcements/:id/publish` | Officer+      | Publish (`draft` or `archived` ➔ `published`)         |
| `POST`  | `/api/v1/announcements/:id/archive` | Officer+      | Archive (`published` ➔ `archived`)                    |

### Publishing Workflow

- Status transitions are validated server-side; invalid transitions return `400 INVALID_STATUS_TRANSITION`.
- `publishedAt` is stamped with the actual publish time on publish; draft rows show no publish date.
- Announcements are never deleted — the lifecycle ends at `archived` (consistent with ADR-020 philosophy).
