# ADR-020: User Account Deactivation via Soft Delete

> **Status**: Accepted  
> **Date**: 2026-08-03  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

In municipal administration systems, user accounts (`users` table) act as the audit authority for registered citizen records, published announcements, and internal operational logs (`createdById`, `updatedById`). Hard-deleting user accounts from the database destroys historical audit trails, triggers foreign key constraint violations, and causes orphaned entity references across the platform.

---

## 🎯 Decision Drivers

- **Audit Preservation**: Retain complete municipal accountability by keeping author and editor records intact indefinitely.
- **Relational Data Integrity**: Enforce foreign key constraints without requiring cascading nullifications or orphaned records ([**ADR-006**](./ADR-006-foreign-keys.md)).
- **Enterprise Security**: Standardize user access revocation through account deactivation rather than row destruction.

---

## 🔍 Considered Options

1. **Hard Deletion** (`DELETE FROM users WHERE id = ?`)
2. **Soft Deactivation** (`UPDATE users SET isActive = false WHERE id = ?`)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Soft Deactivation (`isActive` flag)**.

User accounts in CivicOS MUST NEVER be physically deleted from the database. When an employee leaves or their access is revoked, the account is disabled by setting `isActive = false` in the database schema:

```sql
-- Disable user access without deleting audit history
UPDATE users SET "isActive" = false, "updatedAt" = NOW() WHERE id = $1;
```

### Consequences & Rules:

1. **Authentication Enforcement**: Login middleware and auth services MUST explicitly check `isActive === true` before issuing session JWT tokens.
2. **Admin UI Action**: The User Management interface (`apps/web/src/features/users`) provides a **"Disable User"** or **"Deactivate Account"** button instead of a "Delete User" button.
3. **Foreign Key Protection**: Existing records (`citizens`, `announcements`) referencing the deactivated user's `createdById` remain valid and audit-compliant.

### Consequences & Trade-offs:

- **Pros**:
  - Preserves immutable municipal audit history.
  - Maintains strict database foreign key integrity without orphaned records.
  - Follows enterprise security and compliance standards.
- **Cons & Trade-offs**:
  - All user authentication endpoints and queries must verify `isActive`.
