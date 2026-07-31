# 📢 Module Specification: Announcements

> **Module Name**: `announcement`  
> **Backend Path**: `apps/api/src/modules/announcement`  
> **Frontend Path**: `apps/web/src/features/announcement`  

---

## 📌 Functional Requirements

1. **Bulletin Authoring**: Create, edit, and format municipal announcements with Markdown support.
2. **Publishing Workflow**: Manage status transitions (`DRAFT` ➔ `PUBLISHED` ➔ `ARCHIVED`).
3. **Department Tagging**: Associate bulletins with sponsoring departments (e.g. Public Relations, Transportation).

---

## 🔌 API Contracts

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/announcements` | Public / All | Fetch list of published announcements |
| `POST` | `/api/announcements` | Officer+ | Draft a new announcement bulletin |
| `PATCH` | `/api/announcements/:id/status` | Manager+ | Update publication status (`DRAFT`, `PUBLISHED`, `ARCHIVED`) |
| `DELETE` | `/api/announcements/:id` | Manager+ | Delete bulletin |
