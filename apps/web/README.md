# 💻 CivicOS Web Application (`apps/web`)

> **Client Presentation Layer**: Modern Single Page Application (SPA) for CivicOS municipal administration.

---

## 📌 Overview

`apps/web` is the primary web client for CivicOS. It provides an intuitive, high-performance interface for municipal staff to manage population records, publish announcements, administer users, and monitor city analytics — all behind a role-aware authentication flow.

---

## 🛠️ Technology Stack

| Layer            | Technology                                                                     | Purpose                                   |
| :--------------- | :----------------------------------------------------------------------------- | :---------------------------------------- |
| **Framework**    | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Type-safe component UI framework          |
| **Build Tool**   | [Vite](https://vitejs.dev/)                                                    | HMR dev server & production bundler       |
| **UI Library**   | [Mantine UI v9](https://mantine.dev/)                                          | Component library & design system         |
| **Server State** | [TanStack Query v5](https://tanstack.com/query)                                | Query cache, mutations, invalidation      |
| **Routing**      | [React Router](https://reactrouter.com/)                                       | SPA routing + protected routes            |
| **HTTP**         | [Axios](https://axios.dev/)                                                    | API client (same-origin `/api`, ADR-023)  |
| **Runtime & PM** | [Bun](https://bun.sh/)                                                         | Workspace package manager & script runner |

---

## 📁 Source Directory Structure

Following [**ADR-012: Feature-Oriented Frontend Structure**](../../docs/adr/ADR-012-feature-oriented-frontend.md), domain features are self-contained and shared infrastructure lives outside features:

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

---

## 🚀 Development Scripts

Run scripts from the workspace root:

```bash
# Start dev server with HMR (Vite, port 5173)
bun run dev:web

# Type check & build production bundle
bun run --cwd apps/web build

# Production image (build → Nginx, see docs/deployment.md)
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 📄 Architectural Reference

- [**Design System Specification**](../../docs/design.md)
- [**ADR-005: Feature-Based Structure**](../../docs/adr/ADR-005-feature-based-structure.md)
- [**ADR-007: Mantine UI Adoption**](../../docs/adr/ADR-007-mantine-design-system.md)
- [**ADR-012: Feature-Oriented Frontend Structure**](../../docs/adr/ADR-012-feature-oriented-frontend.md)
- [**ADR-025: Shared Query Hooks & Cross-Feature Cache**](../../docs/adr/ADR-025-shared-query-hooks.md)
