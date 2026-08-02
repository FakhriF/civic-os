# ADR-019: Incremental Docker Compose Configuration

> **Status**: Accepted  
> **Date**: 2026-08-02  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

Pre-configuring complex infrastructure setups in `docker-compose.yml` (such as premature database clusters, custom mesh networks, complex health checks, or unneeded service containers) before application code requires them adds unnecessary cognitive overhead, slows down developer onboarding, and makes debugging early application setup difficult.

---

## 🎯 Decision Drivers

- **Simplicity**: Keep infrastructure configurations minimal, clear, and easy to understand.
- **Ease of Debugging**: Reduce potential failure points during early development phases.
- **Alignment with Roadmap**: Ensure Docker Compose infrastructure grows incrementally in step with the application's actual maturity and milestone progress ([**ADR-014**](./ADR-014-containerized-dev-environment.md)).

---

## 🔍 Considered Options

1. **Upfront Fully-Loaded Infrastructure** (Including all prospective services, databases, networks, and health checks from day one)
2. **Incremental Docker Compose Configuration** (Introducing services and configurations strictly when required by application features)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Incremental Docker Compose Configuration**.

The `docker-compose.yml` file MUST only contain services, environment variables, volumes, and network definitions required for the current stage of development.

Additional configurations (such as PostgreSQL persistent volumes, custom bridge networks, container health checks, or Nginx reverse proxies) will be introduced incrementally only when application features actively depend on them.

### Progression Strategy:

1. **Initial Phase**: Core application containers (`web`, `api`).
2. **Database Integration Phase**: Add PostgreSQL container service (`db`) and volume persistence.
3. **Enterprise & Scale Phase**: Add Nginx reverse proxy, health checks, and isolated networks.

### Consequences & Trade-offs:

- **Pros**:
  - Significantly easier for new developers to understand and modify.
  - Minimizes startup issues and simplifies debugging.
  - Keeps infrastructure configuration strictly aligned with the application's current complexity.
- **Cons & Trade-offs**:
  - Requires updating `docker-compose.yml` incrementally as new milestone features (e.g. database persistence or reverse proxying) are introduced.
