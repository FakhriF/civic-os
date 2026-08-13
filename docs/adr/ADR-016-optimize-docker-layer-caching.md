# ADR-016: Optimize Docker Builds with Layer Caching

> **Status**: Accepted  
> **Date**: 2026-08-01  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

In containerized application development, small source code modifications happen continuously. If a `Dockerfile` executes `COPY . .` before running dependency installation (`bun install`), Docker invalidates the build cache for the installation step every time any source file changes. This forces full dependency reinstalls on every container rebuild, wasting time and network bandwidth.

---

## 🎯 Decision Drivers

- **Build Velocity**: Accelerate container rebuild times during local development and CI/CD automation pipelines.
- **Cache Optimization**: Maximize Docker layer cache hits by separating dependency lockfiles from application source code changes.
- **Industry Standards**: Align with standard Docker optimization patterns for JavaScript/TypeScript monorepos and Bun projects.

---

## 🔍 Considered Options

1. **Single-Layer Source Copying** (Executing `COPY . .` before `bun install`)
2. **Layer-Cached Dependency Copying** (Copying `package.json` and `bun.lock` first, running `bun install`, then copying application source)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Layer-Cached Dependency Copying**.

All application Dockerfiles (`apps/api/Dockerfile`, `apps/web/Dockerfile`) MUST copy dependency manifest files (`package.json` and `bun.lock` / `bun.lockb`) and execute dependency installation as a separate build step BEFORE copying the remaining application source code:

```dockerfile
# 1. Copy workspace dependency manifests first
COPY package.json bun.lock ./

# 2. Install dependencies (cached unless manifests change)
RUN bun install --frozen-lockfile

# 3. Copy application source code afterwards
COPY . .
```

### Consequences & Trade-offs:

- **Pros**:
  - Substantially faster container rebuild times when source code changes.
  - Optimal Docker build cache utilization across local developer machines and CI/CD build agents.
  - Standardized, reliable container build workflow.
- **Cons & Trade-offs**:
  - Requires slightly more verbose `Dockerfile` instructions with separate `COPY` commands.
