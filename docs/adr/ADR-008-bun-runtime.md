# ADR-008: Use Bun as Primary Runtime and Package Manager

> **Status**: Accepted  
> **Date**: 2026-07-28  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

CivicOS is built as a TypeScript monorepo with an Elysia.js backend and React SPA frontend. We need a reliable, high-performance JS/TS runtime and package manager that natively supports workspace management, fast module resolution, and seamless integration with our backend framework.

---

## 🎯 Decision Drivers

- **Elysia Framework Synergy**: Elysia.js is optimized specifically for Bun's native HTTP server and JavaScript engine.
- **Developer Velocity**: Extremely fast package installation and zero-config TypeScript execution without transpile steps.
- **Monorepo Workspaces**: Built-in workspace support for linking local packages (`packages/shared`).

---

## 🔍 Considered Options

1. **Node.js + npm / pnpm**
2. **Bun (Unified Runtime & Package Manager)**

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Bun**.

CivicOS adopts **Bun** as the mandatory primary runtime and package manager across the entire codebase for:

- **Runtime Environment**: Executing backend services and build scripts.
- **Package Management**: Dependency installation (`bun install`, `bun add`).
- **Workspace Management**: Monorepo package resolution across `apps/` and `packages/`.
- **Script Execution**: Task running (`bun run dev`, `bun run build`).

### Consequences & Trade-offs:

- **Pros**:
  - Substantially faster dependency installation and dev server cold starts.
  - Native TypeScript execution out-of-the-box without `ts-node` or `tsx`.
  - Seamless integration with Elysia.js backend engine.
  - Single tool handling package management, script running, and runtime execution.
- **Cons & Trade-offs**:
  - Some third-party Node.js documentation defaults to `npm`/`pnpm` syntax.
  - Developers must use `bun` CLI commands instead of legacy `npm` commands.
