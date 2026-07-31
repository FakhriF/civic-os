# ADR-009: CivicOS is a Pure Bun Project

> **Status**: Accepted  
> **Date**: 2026-07-30  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

Mixed JavaScript toolchains (e.g., running scripts with Node.js, installing dependencies with `npm` or `pnpm`, running servers with Bun, and compiling with `tsc`) lead to lockfile conflicts, environment mismatches across team members, and unpredictable CI/CD build behavior. We need a strict toolchain policy across all environments.

---

## 🎯 Decision Drivers

- **Environment Consistency**: Guarantee identical runtime, package resolution, and lockfile execution across all developer workstations and production CI/CD containers.
- **Zero Lockfile Drift**: Prevent lockfile conflicts (`package-lock.json` vs `pnpm-lock.yaml` vs `bun.lockb`).
- **Maximum Performance**: Leverage Bun's integrated runtime, native TypeScript compilation, and ultra-fast package manager end-to-end.

---

## 🔍 Considered Options

1. **Hybrid Toolchain** (Node.js for build steps, npm/pnpm for installation, Bun for server runtime)
2. **Pure Bun Project** (Strict enforcement of Bun across all tasks, installs, scripts, and runtime)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Pure Bun Project**.

CivicOS is designated as a **Pure Bun Project**. All developer workflows, dependency installations, script execution, server instances, and CI/CD pipelines MUST use Bun exclusively (`bun install`, `bun run`, `bun test`, `bun dev`). Using Node.js, `npm`, `pnpm`, or `yarn` commands is prohibited.

### Consequences & Trade-offs:

- **Pros**:
  - Eliminates lockfile drift (`bun.lockb` is the single source of truth).
  - Identical behavior between local development environments and production Docker containers.
  - Zero requirement for Node.js or secondary package manager installations.
- **Cons & Trade-offs**:
  - Developers must ensure `bun` is installed on their local machine before contributing.
