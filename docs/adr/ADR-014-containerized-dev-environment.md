# ADR-014: Containerized Development Environment

> **Status**: Accepted  
> **Date**: 2026-08-01  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

CivicOS consists of multiple applications (`apps/web`, `apps/api`) and supporting infrastructure services (such as PostgreSQL database and Nginx reverse proxy). Running these services manually during development requires running multiple terminal windows, managing local database instances, and configuring local environment variables manually.

---

## 🎯 Decision Drivers

- **Environment Reproducibility**: Guarantee identical development environments across different developer machines and operating systems.
- **Simplified Onboarding**: Allow new contributors to spin up the entire application stack with a single command.
- **Production Parity**: Ensure local development environment closely mirrors production staging and deployment workflows.

---

## 🔍 Considered Options

1. **Manual Local Execution** (Running Bun scripts and local PostgreSQL instances manually)
2. **Containerized Development Environment** (Docker Compose orchestration with per-app Dockerfiles)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Containerized Development Environment**.

CivicOS adopts Docker Compose as the standard containerized local development and staging environment:

1. **Per-App Dockerfiles**: Each application (`apps/web`, `apps/api`) owns its dedicated container build specification (`Dockerfile`).
2. **Centralized Orchestration**: The repository orchestrates all services (`web`, `api`, `postgres`, plus an isolated `postgres-test` for the test suite) via `docker-compose.yml` at the repository root.

```text
CivicOS/
├── 📂 apps/
│   ├── 📂 web/
│   │   ├── 📄 Dockerfile       # Dev frontend image
│   │   ├── 📄 Dockerfile.prod  # Prod frontend image (ADR-027)
│   │   └── 📄 nginx.conf       # Production reverse proxy
│   └── 📂 api/
│       ├── 📄 Dockerfile       # Dev backend image
│       └── 📄 Dockerfile.prod  # Prod backend image (ADR-027)
│
├── 📄 docker-compose.yml       # Dev multi-service orchestration
└── 📄 docker-compose.prod.yml  # Production orchestration (ADR-027)
```

### Consequences & Trade-offs:

- **Pros**:
  - Consistent environment across all developer workstations and operating systems.
  - Significantly easier onboarding for new contributors.
  - Deployment workflow closely matches local development setup.
  - Clear separation between application image definitions and service orchestration.
- **Cons & Trade-offs**:
  - Slightly slower startup compared to running processes natively in terminal.
  - Requires developers to have Docker & Docker Compose installed.
