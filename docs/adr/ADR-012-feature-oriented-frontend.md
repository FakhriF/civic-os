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

CivicOS frontend application (`apps/web`) organizes code by feature domain within `src/features/`, while maintaining global application-wide infrastructure inside `src/app/`.

```text
apps/web/src/
├── 📂 app/                    # Application-wide core concerns
│   ├── 📂 theme/              # Mantine theme configuration & CSS tokens
│   ├── 📂 router/             # Top-level routing setup & route guards
│   └── 📂 providers/          # React context & TanStack Query providers
│
├── 📂 features/               # Domain-specific feature modules
│   ├── 📂 population/         # Citizen registry components, hooks, services
│   ├── 📂 announcement/       # Bulletin authoring & public feeds
│   ├── 📂 transportation/     # Bus transit & fleet management
│   └── 📂 finance/            # Municipal budget & expenditure tracking
│
├── 📂 components/             # Reusable UI primitives
│   ├── 📂 common/             # Generic buttons, cards, modals, badges
│   └── 📂 layout/             # Header, Sidebar, Footer layout shells
│
├── 📂 pages/                  # Page-level route views
├── 📂 hooks/                  # Global shared React hooks
├── 📂 services/               # Shared HTTP client setup
├── 📂 lib/                    # General utility functions
└── 📂 types/                  # Global frontend types
```

### Consequences & Trade-offs:

- **Pros**:
  - High domain encapsulation and modularity.
  - Clear boundaries between global shell infrastructure (`src/app/`) and business features (`src/features/`).
  - Developers can work on independent modules (e.g., Population vs Transportation) without file collision.
- **Cons & Trade-offs**:
  - Requires developer discipline to keep feature-specific components inside their respective `features/` directory rather than pushing them into global `components/`.
