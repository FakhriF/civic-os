# ⚡ CivicOS API Backend (`apps/api`)

> **API & Business Logic Layer**: High-performance REST API backend service powering CivicOS municipal operations.

---

## 📌 Overview

`apps/api` is the backend REST API engine for CivicOS. Built with **Elysia.js** running on **Bun**, it provides high-throughput, type-safe endpoints for authentication, population registry management, department bulletins, transportation transit, and municipal financial reporting.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Elysia.js](https://elysiajs.com/) | High-performance TypeScript backend server engine |
| **Runtime & PM** | [Bun](https://bun.sh/) | Fast JavaScript/TypeScript execution runtime |
| **Database ORM** | [Drizzle ORM](https://orm.drizzle.team/) | Type-safe SQL query builder & migration engine |
| **Database** | [PostgreSQL 16+](https://www.postgresql.org/) | Primary relational database |
| **Schema Validation** | [Zod](https://zod.dev/) / TypeBox | Strongly typed request body & parameter validation |

---

## 📁 Source Directory Structure

Following [**ADR-013: Feature-Based Backend Modules**](../../docs/adr/ADR-013-feature-based-backend-modules.md) and [**ADR-004: Layered Architecture**](../../docs/adr/ADR-004-layered-architecture.md), server code is organized into app-wide infrastructure (`src/app/`) and business domain modules (`src/modules/`):

```text
apps/api/src/
├── 📂 app/                    # Global Application Infrastructure
│   ├── 📂 config/             # Database & environment configurations
│   ├── 📂 middleware/         # Auth checking, CORS, & error handlers
│   └── 📂 plugins/            # Elysia plugins (JWT, Swagger/OpenAPI)
│
├── 📂 database/               # Data Persistence Layer
│   ├── 📂 schema/             # Drizzle ORM entity definitions
│   └── 📂 migrations/         # Declarative SQL migration scripts
│
├── 📂 modules/                # Business Domain Modules
│   ├── 📂 announcement/       # Bulletin creation, publish/archive workflow
│   ├── 📂 auth/               # Login, JWT authorization, password hashing
│   ├── 📂 population/         # Citizen registry endpoints, search, CRUD services
│   └── 📂 user/               # User management & RBAC role assignments
│
├── 📂 lib/                    # Helper utilities & shared functions
├── 📂 types/                  # API-specific DTOs & context declarations
└── 📄 index.ts                # Elysia server entry point & route registration
```

---

## 🚀 Development Commands

Run scripts from the workspace root or inside `apps/api`:

```bash
# Start API dev server with hot reload (--watch)
bun run --cwd apps/api dev

# Generate database migration SQL files
bun run --cwd apps/api drizzle-kit generate

# Execute pending database migrations
bun run --cwd apps/api drizzle-kit migrate

# Seed initial roles and departments data into database
bun run --cwd apps/api db:seed

# Run unit and integration tests
bun run --cwd apps/api test
```

Default server URL: `http://localhost:3000`

---

## 📄 Architectural Reference

- [**System Architecture Spec**](../../docs/architecture.md)
- [**Database Schema & ERD**](../../docs/database.md)
- [**ADR-002: Domain-Driven Isolation**](../../docs/adr/ADR-002-react-vite.md)
- [**ADR-004: Layered Architecture**](../../docs/adr/ADR-004-layered-architecture.md)
- [**ADR-008: Bun Runtime Adoption**](../../docs/adr/ADR-008-bun-runtime.md)
- [**ADR-013: Feature-Based Backend Modules**](../../docs/adr/ADR-013-feature-based-backend-modules.md)