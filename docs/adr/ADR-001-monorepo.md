# ADR-001: Adopt Monorepo Architecture

> **Status**: Accepted  
> **Date**: 2026-07-10  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

CivicOS consists of multiple related projects: a React web application, an Elysia backend API, shared TypeScript types/schemas, and infrastructure configuration. Managing these in separate repositories would create synchronization friction, complex cross-repo dependency publishing, and fragmented issue tracking.

---

## 🎯 Decision Drivers

- **Code Sharing**: Share Zod schemas, TypeScript types, and utilities seamlessly across frontend and backend.
- **Atomic Commits**: Make single commits that span backend API changes and frontend feature updates.
- **Unified Tooling**: Single `package.json` root setup for linting, formatting, building, and running local infrastructure.

---

## 🔍 Considered Options

1. **Polyrepo (Separate Repositories for Web, API, and Packages)**
2. **Monorepo (Single Unified Repository with Workspace Packages)**

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Monorepo Architecture**.

All frontend apps (`apps/web`), backend services (`apps/api`), shared libraries (`packages/shared`), and infrastructure configs (`docker/`) live within a single repository managed with Bun workspaces.

```text
CivicOS/
├── 📂 apps/          # Monorepo web and api applications
├── 📂 packages/      # Shared workspace packages
└── 📂 docker/        # Containerization configs
```

### Consequences & Trade-offs:

- **Pros**: Zero friction code sharing, atomic cross-layer commits, centralized CI/CD, simplified developer onboarding.
- **Cons**: Requires clear internal boundaries to prevent circular dependencies between workspace packages.
