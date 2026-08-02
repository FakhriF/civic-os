# ADR-017: Development Containers Use Bind Mounts

> **Status**: Accepted  
> **Date**: 2026-08-02  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

In containerized development environments ([**ADR-014**](./ADR-014-containerized-dev-environment.md)), developers need to edit application source code (`apps/web`, `apps/api`) on their host machines and immediately observe hot module replacement (HMR) or server hot-reloading. Rebuilding Docker container images or restarting containers after every minor file edit severely degrades developer velocity.

---

## 🎯 Decision Drivers

- **Developer Velocity**: Instant code reloading and HMR without rebuilding container images on every code change.
- **Development vs. Production Parity**: Maintain containerized isolation while allowing live local filesystem reflection during active coding.
- **Environment Separation**: Ensure production Docker images remain immutable and static without relying on host bind mounts.

---

## 🔍 Considered Options

1. **Static Container Copying** (Rebuilding Docker images after every code change)
2. **Development Bind Mounts** (Mounting local host source directories into development containers via Docker Compose volumes)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Development Bind Mounts**.

Development Docker Compose configurations (`docker-compose.yml` / `docker-compose.override.yml`) MUST mount local application source directories into running containers using host bind mounts (`volumes:`):

```yaml
services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    volumes:
      - ./apps/api/src:/app/src
    command: bun run --watch src/index.ts

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    volumes:
      - ./apps/web/src:/app/src
    command: bun run dev
```

### Environment Distinction:

- **Development Containers**: Use host bind mounts to provide live code reloading and instant HMR.
- **Production Container Images**: Do NOT use bind mounts. Application code is compiled and baked directly into static, immutable container images.

### Consequences & Trade-offs:

- **Pros**:
  - Instant live reloading during local development sessions.
  - No container image rebuilds required when editing source code.
  - Superior developer experience and rapid feedback loops.
- **Cons & Trade-offs**:
  - Development Compose configurations differ slightly from production Compose files (managed via Docker Compose override files).
