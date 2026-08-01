# 💻 CivicOS Web Application (`apps/web`)

> **Client Presentation Layer**: Modern Single Page Application (SPA) for CivicOS municipal administration.

---

## 📌 Overview

`apps/web` is the primary web client for CivicOS. It provides an intuitive, high-performance interface for municipal staff, department managers, city executives, and administrators to interact with city services, manage population records, publish announcements, and monitor city analytics.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Type-safe component UI framework |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | Sub-second HMR dev server & Rollup production bundler |
| **UI Library** | [Mantine UI v9](https://mantine.dev/) | Component library, notifications, & design system tokens |
| **Styling** | PostCSS + Mantine PostCSS Preset | CSS variables & Mantine style processing |
| **Runtime & PM** | [Bun](https://bun.sh/) | Fast workspace package manager & script runner |

---

## 📁 Source Directory Structure

Following [**ADR-012: Feature-Oriented Frontend Structure**](../../docs/adr/ADR-012-feature-oriented-frontend.md), the codebase separates global application infrastructure from domain-specific features:

```text
apps/web/src/
├── 📂 api/                    # HTTP client instances & REST endpoints
├── 📂 app/                    # Global Application Core
│   ├── 📂 theme/              # Mantine theme tokens & PostCSS setup
│   ├── 📂 router/             # App routing configuration & route guards
│   └── 📂 providers/          # Top-level React context & query providers
│
├── 📂 constants/              # Global constant values
├── 📂 features/               # Domain-Specific Feature Modules
│   ├── 📂 population/         # Citizen registry tables, filters, forms
│   ├── 📂 announcement/       # Bulletin creation, publish/archive workflow
│
├── 📂 components/             # Reusable UI Primitives
│   ├── 📂 ui/                 # Generic buttons, modals, cards, badges
│   └── 📂 layout/             # Header shell, collapsible sidebar, footer
│
├── 📂 pages/                  # Page Route Views
├── 📂 hooks/                  # Global shared React hooks
├── 📂 lib/                    # Helper functions & utilities
├── 📂 types/                  # Web-specific TypeScript interfaces
└── 📂 assets/                 # Static images, icons, and fonts
```

---

## 🚀 Development Scripts

Run scripts from the workspace root or inside `apps/web`:

```bash
# Start local development server (with HMR)
bun run --cwd apps/web dev

# Type check & build production bundle
bun run --cwd apps/web build

# Run ESLint check
bun run --cwd apps/web lint

# Preview production build locally
bun run --cwd apps/web preview
```

---

## 📄 Architectural Reference

- [**Design System Specification**](../../docs/design.md)
- [**ADR-005: Feature-Based Structure**](../../docs/adr/ADR-005-feature-based-structure.md)
- [**ADR-007: Mantine UI Adoption**](../../docs/adr/ADR-007-mantine-design-system.md)
- [**ADR-012: Feature-Oriented Frontend Structure**](../../docs/adr/ADR-012-feature-oriented-frontend.md)
