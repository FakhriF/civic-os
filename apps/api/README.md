# ⚡ CivicOS API Backend (`apps/api`)

> **API & Business Logic Layer**: High-performance REST API backend service powering CivicOS municipal operations.

---

## 📌 Overview

`apps/api` is the backend REST API engine for CivicOS. Built with **Elysia.js** running on **Bun**, it provides type-safe endpoints for authentication (JWT + refresh cookie), user management (RBAC), population registry, and announcements.

---

## 🛠️ Technology Stack

| Layer            | Technology                                | Purpose                                            |
| :--------------- | :---------------------------------------- | :------------------------------------------------- |
| **Framework**    | [Elysia.js](https://elysiajs.com/)        | High-performance TypeScript backend engine         |
| **Validation**   | Elysia `t` (TypeBox)                      | Strongly typed request body & parameter validation |
| **Database ORM** | [Drizzle ORM](https://orm.drizzle.team/)  | Type-safe SQL query builder & migration engine     |
| **Database**     | [PostgreSQL](https://www.postgresql.org/) | Primary relational database                        |
| **Auth**         | `@elysia/jwt`                             | Access token + HttpOnly refresh cookie (ADR-022)   |
| **Runtime & PM** | [Bun](https://bun.sh/)                    | Execution runtime, test runner, package manager    |

---

## 📁 Source Directory Structure

Following [**ADR-013: Feature-Based Backend Modules**](../../docs/adr/ADR-013-feature-based-backend-modules.md) and [**ADR-004: Layered Architecture**](../../docs/adr/ADR-004-layered-architecture.md), server code is organized into app-wide infrastructure (`src/app/`) and business domain modules (`src/modules/`):

```text
apps/api/src/
├── 📂 app/                    # Application Infrastructure
│   ├── 📂 middleware/         # Auth checking, requireRole guard
│   ├── 📂 plugins/            # Elysia plugins (database, JWT)
│   └── 📂 utils/              # Shared helpers (unique-violation)
│
├── 📂 database/               # Data Persistence Layer
│   ├── 📂 schema/             # Drizzle ORM entity definitions
│   └── 📂 migrations/         # Declarative SQL migration scripts
│
├── 📂 modules/                # Business Domain Modules
│   ├── 📂 announcement/       # Bulletin creation, publish/archive workflow
│   ├── 📂 auth/               # Login, JWT, refresh cookie
│   ├── 📂 dashboard/          # Executive dashboard aggregates
│   ├── 📂 department/         # Department master data
│   ├── 📂 population/         # Citizen registry CRUD, search
│   ├── 📂 role/               # Role master data
│   └── 📂 user/               # User management & RBAC assignments
│
├── 📂 lib/                    # Shared pure utilities (pagination, test helpers)
├── 📂 test/                   # Unit + API test suites (bun test, ADR-026)
├── 📄 app.ts                  # App builder (exported for in-process tests)
└── 📄 index.ts                # Server entry point (binds port)
```

---

## 🚀 Development Commands

Run scripts from the workspace root:

```bash
# Start API dev server with hot reload (--watch), port 3000
bun run dev:api

# Execute pending database migrations
bun run --cwd apps/api db:migrate

# Seed initial roles, departments, and default admin (idempotent)
bun run --cwd apps/api db:seed

# Generate a new migration SQL file from schema changes
bunx --cwd apps/api drizzle-kit generate

# Run unit + API tests (requires: docker compose up -d postgres-test)
bun run test
```

---

## 📄 Architectural Reference

- [**System Architecture Spec**](../../docs/architecture.md)
- [**Database Schema & ERD**](../../docs/database.md)
- [**ADR-002: React + Vite Frontend**](../../docs/adr/ADR-002-react-vite.md)
- [**ADR-004: Layered Architecture**](../../docs/adr/ADR-004-layered-architecture.md)
- [**ADR-008: Bun Runtime Adoption**](../../docs/adr/ADR-008-bun-runtime.md)
- [**ADR-013: Feature-Based Backend Modules**](../../docs/adr/ADR-013-feature-based-backend-modules.md)
- [**ADR-026: API Testing Strategy**](../../docs/adr/ADR-026-api-testing-strategy.md)
