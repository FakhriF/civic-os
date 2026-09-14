# ADR-004: Adopt Layered Architecture (Presentation -> Business -> Data)

> **Status**: Accepted  
> **Date**: 2026-07-16  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

Without strict separation of concerns, backend route handlers tend to mix HTTP request parsing, complex business rules, permission checks, and raw SQL queries into single massive controller functions. This results in fragile code that is difficult to audit or unit test.

---

## 🎯 Decision Drivers

- **Separation of Concerns**: Distinct boundaries for HTTP handlers, business logic, and database persistence.
- **Audit Compliance**: Centralized business service entry points to enforce municipal authorization rules.
- **Maintainability**: Modifying database schemas should not rewrite HTTP controller logic.

---

## 🔍 Considered Options

1. **Flat Controller Model** (Routes execute ORM queries directly)
2. **Layered Architecture** (`Presentation Layer` ➔ `Business Layer` ➔ `Data Layer`)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Layered Architecture**.

All backend modules MUST adhere to a three-tier layered pattern:

```text
Presentation Layer (Routes & Controllers)
       ↓
Business Layer (Service Logic & Permissions)
       ↓
Data Layer (Drizzle ORM & Database Access)
```

- **Presentation Layer**: Handles HTTP requests, validates request bodies with Elysia's `t` (TypeBox) schemas, and formats responses.
- **Business Layer**: Implements domain business logic, role-based authorization checks, and calculations.
- **Data Layer**: Executes Drizzle ORM queries against PostgreSQL. Direct database calls from routes are prohibited.

### Consequences & Trade-offs:

- **Pros**: Clean code separation, high unit testability of business services, strict auditability.
- **Cons**: Minor indirection layer when passing parameters between handlers and services.
