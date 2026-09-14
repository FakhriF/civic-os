# 📂 Monorepo Project Structure & Conventions

> **Monorepo Architecture**: Decoupled repository organizing apps, documentation, and infrastructure.

---

## 🏗️ High-Level Directory Overview

```text
CivicOS/
├── 📂 apps/                   # Applications (Web Frontend & API Backend)
│   ├── 📂 web/                # React + Mantine Frontend SPA
│   └── 📂 api/                # Elysia.js REST Backend Service
│
├── 📂 docs/                   # Architectural & Product Documentation
│   ├── 📂 adr/                # Architectural Decision Records (ADR-001 … ADR-028)
│   ├── 📂 modules/            # Business Module Specifications
│   ├── 📄 architecture.md     # System architecture spec
│   ├── 📄 database.md         # Database schema & ERD
│   ├── 📄 design.md           # Design system tokens & rules
│   ├── 📄 development-standards.md # Engineering standards & DoD
│   ├── 📄 deployment.md       # VPS production deployment runbook
│   ├── 📄 project-structure.md # This document
│   ├── 📄 roadmap.md          # Project rollout roadmap
│   └── 📄 vision.md           # Product vision & goals
│
├── 📂 specs/                  # Spec-driven feature plans (requirements → design → tasks)
│   ├── 📂 _templates/         # Templates for new feature specs
│   ├── 📂 auth/
│   ├── 📂 user-management/
│   ├── 📂 population/
│   ├── 📂 announcement/
│   ├── 📂 testing/
│   └── 📂 deploy/
│
├── 📄 docker-compose.yml      # Dev stack (Postgres, API, Web — bind mounts, hot reload)
├── 📄 docker-compose.prod.yml # Production stack (Nginx + API + Postgres)
├── 📄 package.json            # Root Bun workspace manifest & task scripts
├── 📄 tsconfig.base.json      # Base TypeScript config
└── 📄 .env.example            # Environment variable template (ADR-021)
```

> [!NOTE]
> There is no `packages/` workspace. Shared workspace packages were dropped; `@civicos/shared` does **not** exist. API response shapes are mirrored per feature in the web app — see [**ADR-028**](./adr/ADR-028-api-web-type-contracts.md).

---

## 💻 Frontend Application Layout (`apps/web/src/`)

The frontend follows a **Feature-Based Architecture**. Code related to a specific domain (e.g., Population) is grouped together, with the application bootstrap and route table at the root of `src/`.

```text
apps/web/src/
├── 📂 features/               # Feature-based domain modules
│   ├── 📂 announcement/       # Bulletin page, form dialog, query hooks
│   ├── 📂 authentication/     # Login page, auth context, protected route
│   ├── 📂 dashboard/          # Stat cards, recent bulletins, quick actions
│   ├── 📂 population/         # Citizen registry page, form dialog, query hooks
│   └── 📂 users/              # User directory, form dialog, query hooks
│
├── 📂 layouts/                # Page shell layouts (header, sidebar)
├── 📂 lib/                    # Cross-feature hooks & helper functions (ADR-025)
├── 📂 services/               # API client instance (axios) & interceptors
├── 📄 App.tsx                 # Route table
└── 📄 main.tsx                # App bootstrap: providers, theme, router
```

> [!NOTE]
> Feature directories are flat: pages, dialogs, and hooks live side by side (e.g. `features/users/users-page.tsx`, `features/users/use-users.ts`). There are no per-feature `components/` or `hooks/` subfolders.
>
> Application-wide providers (Mantine, TanStack Query, auth, router) are wired in `main.tsx`, and the route table lives in `App.tsx`. There is no `src/app/`, `src/components/`, or `src/hooks/` layer; see the amendment in [ADR-012](./adr/ADR-012-feature-oriented-frontend.md).

---

## ⚡ Backend Application Layout (`apps/api/src/`)

The backend follows a **Feature-Based Domain Architecture** organized into app infrastructure (`src/app/`) and business domain modules (`src/modules/`).

```text
apps/api/src/
├── 📂 app/                    # Application Infrastructure
│   ├── 📂 middleware/         # Auth verification & role guards
│   ├── 📂 plugins/            # Elysia plugins (database)
│   └── 📂 utils/              # Infrastructure helpers (unique-violation)
│
├── 📂 database/               # Data Persistence Layer
│   ├── 📂 schema/             # Drizzle ORM entity definitions
│   ├── 📂 migrations/         # Declarative SQL migrations
│   ├── 📄 client.ts           # Pool & Drizzle client
│   └── 📄 seed.ts             # Seed data
│
├── 📂 modules/                # Self-contained business domain modules
│   ├── 📂 announcement/       # Bulletin endpoints, publish/archive workflow
│   ├── 📂 auth/               # Login, refresh, logout
│   ├── 📂 dashboard/          # Executive metrics
│   ├── 📂 department/         # Department lookup
│   ├── 📂 population/         # Citizen registry endpoints, search, CRUD services
│   ├── 📂 role/               # Role lookup
│   └── 📂 user/               # User management & role provisioning
│
├── 📂 lib/                    # Helper utilities & shared functions
├── 📂 test/                   # Unit + API test suites (ADR-026)
├── 📄 app.ts                  # App builder & route registration (exported for tests)
└── 📄 index.ts                # Server entry point
```

---

## ⚖️ Global vs. Feature-Scoped Conventions

| Code Type                 | Scope                          | Placement Directory         | Example                                                       |
| :------------------------ | :----------------------------- | :-------------------------- | :------------------------------------------------------------ |
| **Feature Component**     | Specific to one business domain | `src/features/<feature>/`   | `announcement-form-dialog.tsx`, `citizen-form-dialog.tsx`     |
| **Feature Hook**          | Business state/query hook       | `src/features/<feature>/`   | `use-citizens.ts`, `use-announcements.ts`                     |
| **Shared Hook**           | Cross-feature state/query hook  | `src/lib/`                  | `useRoleOptions()`, `useDepartmentOptions()` (ADR-025)        |
| **Shared Service**        | HTTP client setup               | `src/services/`             | `api-client.ts`                                               |
| **Global Component**      | Generic, reusable UI            | —                           | Provided by Mantine UI (ADR-007); no global component library |
