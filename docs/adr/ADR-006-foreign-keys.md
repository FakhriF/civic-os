# ADR-006: Relational Data Normalization & Foreign Key Constraints

> **Status**: Accepted  
> **Date**: 2026-07-20  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

In municipal database systems, storing duplicate text strings (e.g., department names or role titles directly on user or citizen records) leads to data inconsistency when department names change or roles are updated. We need a clear database design policy regarding entity relationships.

---

## 🎯 Decision Drivers

- **Data Integrity**: Ensure single source of truth across all relational entities.
- **Cascading Updates**: Name changes for departments or roles must instantly reflect across all associated users without bulk string updates.
- **Referential Integrity**: Prevent orphaned records (e.g., announcements referencing non-existent users or departments).

---

## 🔍 Considered Options

1. **Denormalized String Fields** (Store raw text like `department: "Population"`)
2. **Relational Normalization with Foreign Key Constraints** (`departmentId -> departments.id`)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Relational Normalization with Foreign Keys**.

All database entities MUST reference related entities via immutable Foreign Keys (`roleId`, `departmentId`, `createdById`) enforced by PostgreSQL constraints.

### Consequences & Trade-offs:

- **Pros**: Zero data duplication, guaranteed referential integrity, simplified schema updates, strict database-level enforcement.
- **Cons**: Requires `JOIN` queries for detailed views, mitigated via indexed B-Tree keys and Drizzle ORM query builders.
