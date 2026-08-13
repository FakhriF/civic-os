# ADR-021: Environment-Based Configuration

> **Status**: Accepted  
> **Date**: 2026-08-02  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

CivicOS consists of multiple services (`apps/web`, `apps/api`) and supporting infrastructure (PostgreSQL database, Nginx proxy) that require dynamic configuration values such as database credentials, connection strings, JWT secret keys, and runtime environment flags (`NODE_ENV`, `PORT`). Hardcoding these configuration values directly into source code or Docker compose files creates severe security vulnerabilities, prevents multi-environment deployments, and risks leaking credentials into version control.

---

## 🎯 Decision Drivers

- **Security & Secret Protection**: Ensure passwords, secret keys, and database credentials remain outside source control.
- **Multi-Environment Portability**: Enable seamless configuration switching between `development`, `staging`, and `production`.
- **Twelve-Factor App Compliance**: Follow industry best practices by storing configuration strictly in environment variables.

---

## 🔍 Considered Options

1. **Hardcoded Configuration Files** (Committing config files with hardcoded credentials)
2. **Environment-Based Configuration** (Injecting variables via `.env` files and environment passes)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Environment-Based Configuration**.

All application configurations and runtime secrets MUST be loaded strictly via environment variables:

1. **Documented Examples (`.env.example`)**: The repository root and application workspaces maintain committed `.env.example` templates documenting all required environment variables with non-sensitive fallback defaults.
2. **Local Environment (`.env`)**: Developers maintain their own uncommitted local `.env` file (ignored via `.gitignore` and `.dockerignore` per [**ADR-015**](./ADR-015-ignore-local-files-in-docker.md)).
3. **Container Injection**: Docker Compose passes environment variables directly into container runtimes.

```text
CivicOS/
├── 📄 .env.example            # Committed documentation template for required env vars
├── 📄 .env                    # Uncommitted local environment file (git-ignored)
├── 📂 apps/
│   ├── 📂 api/
│   │   ├── 📄 .env.example
│   │   └── 📄 .env
│   └── 📂 web/
│       ├── 📄 .env.example
│       └── 📄 .env
```

### Consequences & Trade-offs:

- **Pros**:
  - Secrets stay strictly out of source code and Git repositories.
  - Seamless deployment across local development, CI/CD, staging, and production clusters.
  - Keeps Docker Compose configuration files clean and decoupled from raw credentials.
  - Strictly follows industry standards for 12-factor cloud applications.
- **Cons & Trade-offs**:
  - Developers must copy `.env.example` to `.env` before running the application locally.
