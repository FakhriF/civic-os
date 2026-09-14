# ADR-012: Feature-Oriented Frontend Structure

> **Status**: Accepted  
> **Date**: 2026-08-01  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

As CivicOS expands to support multiple municipal operational domains (such as Population Registry, Public Announcements, Municipal Finance, and Transportation Transit), organizing frontend code purely by technical layer (placing all components in a top-level `components/` folder and all hooks in `hooks/`) causes code scatter, difficult navigation, and high merge friction.

---

## 🎯 Decision Drivers

- **Domain Co-location**: Keep feature UI components, custom hooks, services, and types together within their domain module.
- **Application-Wide Isolation**: Separate global application concerns (theme tokens, routing configuration, top-level context providers) from feature logic.
- **Scalability**: Enable new municipal modules (e.g. Finance, Transportation) to be added without cluttering root directories.

---

## 🔍 Considered Options

1. **Layer-Based Layout** (All components in global `src/components/`, all hooks in `src/hooks/`)
2. **Feature-Oriented Structure with App Core** (`src/app/` for core concerns + `src/features/<domain>/` for modules)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Feature-Oriented Structure with App Core**.

CivicOS frontend application (`apps/web`) organizes code by feature domain within `src/features/`, keeping application-wide concerns (`main.tsx` providers, `App.tsx` routes) out of the feature modules.

```text
apps/web/src/
├── 📂 features/               # Domain-specific feature modules
│   ├── 📂 announcement/       # Bulletin authoring & public feeds
│   ├── 📂 authentication/     # Login, session context, route guard
│   ├── 📂 dashboard/          # Stat cards, recent bulletins
│   ├── 📂 population/         # Citizen registry components, hooks, services
│   └── 📂 users/              # User management & RBAC assignments
│
├── 📂 layouts/                # Page shell (header, sidebar)
├── 📂 lib/                    # Cross-feature hooks & helpers (ADR-025)
├── 📂 services/               # Shared HTTP client setup
├── 📄 App.tsx                 # Route table
└── 📄 main.tsx                # App bootstrap: providers, theme, router
```

> [!NOTE]
> **Amendment (2026-08-14)** — the original decision placed application-wide core in `src/app/{theme,router,providers}`. That folder was never populated and is not tracked by Git; the core lives in `main.tsx` (Mantine, TanStack Query, auth and router providers) and `App.tsx` (route table). Auth/session context is deliberately owned by `features/authentication/` as an application-state exception. Extracting a `src/app/` layer is deferred until the bootstrap grows beyond theme + providers + router (e.g. a notification provider, an error boundary, i18n); the decision drivers and the feature-oriented rule are unchanged.

### Consequences & Trade-offs:

- **Pros**:
  - High domain encapsulation and modularity.
  - Clear boundaries between the application bootstrap (`main.tsx`, `App.tsx`) and business features (`src/features/`).
  - Developers can work on independent modules (e.g., Population vs Announcements) without file collision.
- **Cons & Trade-offs**:
  - Requires developer discipline to keep feature-specific components inside their respective `features/` directory rather than pushing them into a global `components/`.
