# ADR-015: Ignore Local Development Files in Docker Builds

> **Status**: Accepted  
> **Date**: 2026-08-01  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

When building Docker container images for applications (`apps/api`, `apps/web`), copying the application context without explicit exclusion rules can accidentally include host-machine artifacts such as local `node_modules`, build output folders (`dist/`, `.vite/`), Git metadata (`.git/`), temporary log files, and local environment secrets (`.env`) into the Docker build context.

---

## 🎯 Decision Drivers

- **Security & Secret Prevention**: Prevent local `.env` files containing development secrets or API keys from leaking into production container images.
- **Build Speed & Image Size**: Exclude local host dependencies and build artifacts from inflating Docker context transfer sizes.
- **Cross-Platform Safety**: Prevent host OS platform-specific binaries (e.g., macOS/Windows compiled node modules) from polluting Linux container runtimes.

---

## 🔍 Considered Options

1. **Unfiltered Context Copying** (Relying only on selective `COPY` commands in Dockerfiles)
2. **Dedicated `.dockerignore` Files** (Enforcing per-application `.dockerignore` rules)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Dedicated `.dockerignore` Files**.

Each application workspace (`apps/api`, `apps/web`) MUST include a dedicated `.dockerignore` file to exclude local host artifacts, environment secrets, and temporary files from container build contexts:

```text
# Standard .dockerignore Rules
node_modules
dist
.vite
.env*
.git
.gitignore
*.log
```

### Consequences & Trade-offs:

- **Pros**:
  - Significantly smaller image sizes and faster Docker build context transfers.
  - Ensures clean, reproducible dependency resolution inside the Linux container environment.
  - Protects secret environment files (`.env`, `.env.local`) from accidental container inclusion.
  - Eliminates host OS platform binary contamination.
- **Cons & Trade-offs**:
  - Developers must maintain `.dockerignore` patterns when adding new temporary build tools.
