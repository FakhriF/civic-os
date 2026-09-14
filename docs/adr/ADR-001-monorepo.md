# ADR-001: Adopt Monorepo Architecture

> **Status**: Accepted  
> **Date**: 2026-07-10  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

CivicOS consists of multiple related projects: a React web application, an Elysia backend API, and the infrastructure configuration that runs them. Managing these in separate repositories would create synchronization friction, complex cross-repo dependency publishing, and fragmented issue tracking.

---

## 🎯 Decision Drivers

- **Co-evolution**: Change the API contract and its web-side mirror in a single atomic commit (ADR-028).
- **Atomic Commits**: Make single commits that span backend API changes and frontend feature updates.
- **Unified Tooling**: Single `package.json` root setup for linting, formatting, building, and running local infrastructure.

---

## 🔍 Considered Options

1. **Polyrepo (Separate Repositories for Web, API, and Packages)**
2. **Monorepo (Single Unified Repository with Workspace Packages)**

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Monorepo Architecture**.

Both applications (`apps/web`, `apps/api`) and the documents and specs that describe them live within a single repository managed with Bun workspaces.

```text
CivicOS/
├── 📂 apps/          # Monorepo web and api applications
├── 📂 docs/          # Architecture, ADRs, module specifications
├── 📂 specs/         # Spec-driven feature plans
└── 📄 docker-compose.yml   # Local dev stack
```

### Consequences & Trade-offs:

- **Pros**: Zero friction code sharing, atomic cross-layer commits, centralized CI/CD, simplified developer onboarding.
- **Cons**: Requires clear internal boundaries to prevent circular dependencies between workspace apps.
