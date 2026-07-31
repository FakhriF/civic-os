# ADR-010: Use Official Project Templates for Framework Initialization

> **Status**: Accepted  
> **Date**: 2026-08-01  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

When initializing new applications and services in CivicOS (such as React + Vite frontend applications or Elysia backend microservices), setting up build tooling, TypeScript compilers, bundler options, and folder structures manually from scratch is error-prone, time-consuming, and prone to configuration drift.

---

## 🎯 Decision Drivers

- **Author Maintenance**: Official templates are maintained and kept up-to-date directly by framework authors.
- **Best Practices**: Templates incorporate recommended defaults for bundling, TypeScript target settings, and HMR.
- **Setup Reliability**: Eliminates initial configuration mistakes, missing peer dependencies, and setup friction.

---

## 🔍 Considered Options

1. **Manual Custom Boilerplate Scaffolding from Scratch**
2. **Official Framework CLI Project Templates** (e.g., `bun create vite`, `bun create elysia`)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Official Framework CLI Project Templates**.

All new application workspaces and module packages in CivicOS MUST be initialized using official framework project starters and CLI generators. Unneeded default boilerplate or starter files can be removed after initialization.

### Consequences & Trade-offs:

- **Pros**:
  - Maintained directly by core framework maintainers.
  - Guarantees adherence to current ecosystem best practices.
  - Significantly reduces setup errors and developer onboarding time.
  - Easy to prune unnecessary initial files post-generation.
- **Cons & Trade-offs**:
  - May include default demo files or initial assets that require minor cleanup after creation.
