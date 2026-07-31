# ADR-005: Adopt Feature-Based Folder Structure

> **Status**: Accepted  
> **Date**: 2026-07-18  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

As CivicOS grows to cover multiple municipal domains (Population, Announcements, Transportation, Finance), organizing frontend code by traditional technical layer (`components/`, `hooks/`, `services/`) causes code scatter and merge friction when developers work on different features simultaneously.

---

## 🎯 Decision Drivers

- **Scalability**: Ability to add new municipal modules without cluttering global directories.
- **Maintainability**: Co-location of UI, custom hooks, and API queries belonging to a specific domain.
- **Team Autonomy**: Clear boundaries allowing developers to build features independently.

---

## 🔍 Considered Options

1. **Layer-Based Folder Structure** (`src/components`, `src/hooks`, `src/pages`)
2. **Feature-Based Folder Structure** (`src/features/<domain>`)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Feature-Based Folder Structure**.

All frontend code specific to a business domain will reside within `src/features/<domain>/`. Each feature folder exposes a clean public API (`index.ts`) for cross-feature imports.

```text
src/features/population/
├── components/          # Domain-specific components
├── hooks/               # Domain-specific custom hooks & query logic
├── services/            # Feature API calls
├── types/               # Feature types
└── index.ts             # Public feature export
```

### Consequences & Trade-offs:

- **Pros**: High modularity, easier codebase navigation, reduced merge conflicts, clear domain ownership.
- **Cons**: Requires discipline to prevent developers from placing domain-specific components into global `components/`.
