# ADR-011: Strict Dependency Ownership Scoping

> **Status**: Accepted  
> **Date**: 2026-08-01  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

In monorepo architecture, dependencies often get blindly installed into the workspace root `package.json`. This causes bloated root manifests, hidden undeclared dependencies in sub-apps, broken isolated builds, and potential version conflicts across workspace boundaries.

---

## 🎯 Decision Drivers

- **Scope Isolation**: Prevent frontend libraries (React, Mantine) from leaking into backend packages and vice versa.
- **Minimal Deployment Bundles**: Keep build targets lightweight and explicitly scoped.
- **Build Reproducibility**: Ensure sub-packages (`apps/web`, `apps/api`, `packages/shared`) explicitly declare their own `dependencies` and `devDependencies`.

---

## 🔍 Considered Options

1. **Root Hoisting** (Installing dependencies centrally in root `package.json`)
2. **Strict Dependency Ownership** (Every dependency belongs to the smallest scope that requires it)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Strict Dependency Ownership**.

Every third-party dependency MUST belong to the smallest workspace scope that requires it. The workspace root `package.json` ONLY contains root-level workspace tooling (such as TypeScript compiler definitions, `@types/bun`, or root build scripts).

### Ownership Mapping Matrix:

| Dependency | Owner Workspace Scope | Purpose |
| :--- | :--- | :--- |
| **React & React-DOM** | `apps/web` | Frontend UI view layer |
| **Mantine UI** | `apps/web` | Frontend component library & theme engine |
| **Elysia.js** | `apps/api` | Backend REST server framework |
| **Drizzle ORM** | `apps/api` | Database query builder & migrations |
| **PostgreSQL Driver** | `apps/api` | Database connection client |
| **TypeScript** | `Workspace Root` | Monorepo-wide type checking |
| **Shared Linter Configs** | `packages/config` | Shared ESLint & code style standards |

### Consequences & Trade-offs:

- **Pros**:
  - Clean separation of concerns between web, API, and package dependencies.
  - Faster builds and smaller isolated deployment artifacts.
  - Explicit dependency manifests prevent hidden runtime errors.
- **Cons & Trade-offs**:
  - Developers must specify the target workspace when installing dependencies (e.g., `bun add react --cwd apps/web`).
