# ADR-013: Feature-Based Backend Modules

> **Status**: Accepted  
> **Date**: 2026-08-01  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

In traditional backend applications, code is frequently organized strictly by technical layer (e.g. `controllers/`, `services/`, `models/`). As CivicOS expands across multiple municipal domain areas (Population, Announcements, Finance, Transportation), layer-based organization forces developers to scatter a single feature's logic across distant folders, making features difficult to navigate, test, and maintain independently.

---

## 🎯 Decision Drivers

- **Domain Isolation**: Each business module owns its route definitions, validation logic, service rules, and DTOs.
- **Maintainability**: Adding, modifying, or auditing a municipal feature requires editing files within a single domain module folder.
- **Independent Evolution**: High-volume domains (e.g. Population Registry vs Public Bulletins) can evolve without introducing cross-module regressions.

---

## 🔍 Considered Options

1. **Layer-Based Backend Structure** (`src/controllers/`, `src/services/`, `src/database/`)
2. **Feature-Based Backend Modules** (`src/modules/<domain>/` + `src/app/` core infrastructure)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Feature-Based Backend Modules**.

CivicOS backend API (`apps/api`) organizes server logic by business module inside `src/modules/<domain>/` while keeping global server infrastructure (configs, middleware, plugins) within `src/app/`.

```text
apps/api/src/
├── 📂 app/                    # Application-Wide Infrastructure
│   ├── 📂 middleware/         # Auth verification & role guards
│   ├── 📂 plugins/            # Elysia plugins (database)
│   └── 📂 utils/              # Infrastructure helpers
│
├── 📂 database/               # Data Persistence Layer
│   ├── 📂 schema/             # Drizzle ORM entity definitions
│   ├── 📂 migrations/         # Declarative SQL migrations
│   ├── 📄 client.ts           # Pool & Drizzle client
│   └── 📄 seed.ts             # Seed data
│
├── 📂 modules/                # Self-Contained Domain Modules
│   ├── 📂 announcement/       # Bulletin authoring & publish/archive workflow
│   ├── 📂 auth/               # Login endpoints & JWT token handling
│   ├── 📂 dashboard/          # Executive metrics
│   ├── 📂 department/         # Department lookup
│   ├── 📂 population/         # Citizen registry endpoints, search, CRUD services
│   ├── 📂 role/               # Role lookup
│   └── 📂 user/               # User management & role provisioning
│
├── 📂 lib/                    # Helper utilities & shared functions
├── 📂 test/                   # Unit + API test suites (ADR-026)
├── 📄 app.ts                  # App builder & route registration (exported for tests)
└── 📄 index.ts                # Server entry point & route registration
```

### Consequences & Trade-offs:

- **Pros**:
  - Modules like Population, Announcements, User, and Auth remain self-contained.
  - Simplifies integration and unit testing for domain services.
  - Keeps core server infrastructure (`src/app/`) distinct from domain business logic (`src/modules/`).
- **Cons & Trade-offs**:
  - Shared utilities across modules must be explicitly placed in `src/lib/`.
