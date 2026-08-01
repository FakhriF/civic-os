# 📚 CivicOS Documentation Portal

Welcome to the **CivicOS** documentation hub. This directory contains the complete technical specifications, architectural guidelines, database schemas, design tokens, and Architecture Decision Records (ADRs) for CivicOS.

---

## 🗂️ Documentation Map

```mermaid
graph TD
    Docs["📚 CivicOS Docs"]
    Vision["🎯 Vision & Mission"]
    Arch["🏗️ Architecture"]
    DB["🗄️ Database & ERD"]
    Design["🎨 Design System"]
    Struct["📂 Project Structure"]
    Roadmap["🗺️ Product Roadmap"]
    Standards["🛠️ Development Standards"]
    ADR["📜 ADR Records"]
    Modules["🧩 Business Modules"]

    Docs --> Vision
    Docs --> Arch
    Docs --> DB
    Docs --> Design
    Docs --> Struct
    Docs --> Roadmap
    Docs --> Standards
    Docs --> ADR
    Docs --> Modules
```

---

## 📋 Table of Contents

### 1. Core Specifications

- [**Product Vision & Scope**](./vision.md)  
  *Defines the product purpose, municipal mission, target audience, and high-level goals.*

- [**System Architecture**](./architecture.md)  
  *Detailed breakdown of monorepo design, layered architecture, technology choices, and service boundaries.*

- [**Database Schema & ERD**](./database.md)  
  *Entity definitions, relational mappings, foreign key constraints, data dictionary, and visual ERD.*

- [**Design System Guidelines**](./design.md)  
  *Design philosophy, color tokens, typography scale, component standards, accessibility rules, and layout specs.*

- [**Project Structure**](./project-structure.md)  
  *Organization of apps, packages, feature folders, global assets, and monorepo conventions.*

- [**Product Roadmap**](./roadmap.md)  
  *Phase-by-phase execution plan, milestone timelines, and feature rollout tracking.*

- [**Development Standards**](./development-standards.md)  
  *Coding conventions, Git workflows, error handling protocols, API contracts, AI policy, and DoD checklist.*

---

### 2. Architecture Decision Records (ADRs)

All architectural decisions are documented in the [**ADR Registry (`docs/adr/`)**](./adr/README.md):

| Category | Key Decisions Included | Full Registry |
| :--- | :--- | :--- |
| 🏗️ **Monorepo & Core** | Monorepo (`001`), Bun Runtime (`008`), Pure Bun (`009`), Templates (`010`), Dependencies (`011`) | [View Specs ➔](./adr/README.md#-1-monorepo--core-toolchain) |
| 💻 **Frontend & UI** | React + Vite (`002`), Feature Structure (`005`), Mantine (`007`), App Shell (`012`) | [View Specs ➔](./adr/README.md#-2-frontend--design-system) |
| ⚡ **Backend & Data** | REST API (`003`), Layered Model (`004`), Foreign Keys (`006`), Domain Modules (`013`) | [View Specs ➔](./adr/README.md#-3-backend--data-architecture) |
| 🐳 **DevOps & Infra** | Docker Compose (`014`), `.dockerignore` (`015`), Layer Caching (`016`) | [View Specs ➔](./adr/README.md#-4-infrastructure--devops) |

<details>
<summary><b>📜 Click to Expand Complete ADR List (16 Records)</b></summary>

- [**ADR-001: Monorepo Architecture**](./adr/ADR-001-monorepo.md)
- [**ADR-002: React + Vite Frontend**](./adr/ADR-002-react-vite.md)
- [**ADR-003: REST API Paradigm**](./adr/ADR-003-rest-api.md)
- [**ADR-004: Layered Architecture**](./adr/ADR-004-layered-architecture.md)
- [**ADR-005: Feature-Based Structure**](./adr/ADR-005-feature-based-structure.md)
- [**ADR-006: Foreign Key Normalization**](./adr/ADR-006-foreign-keys.md)
- [**ADR-007: Mantine Design System**](./adr/ADR-007-mantine-design-system.md)
- [**ADR-008: Bun Runtime & Package Manager**](./adr/ADR-008-bun-runtime.md)
- [**ADR-009: Pure Bun Project**](./adr/ADR-009-pure-bun-project.md)
- [**ADR-010: Official Project Templates**](./adr/ADR-010-official-templates.md)
- [**ADR-011: Strict Dependency Ownership**](./adr/ADR-011-dependency-ownership.md)
- [**ADR-012: Feature-Oriented Frontend Structure**](./adr/ADR-012-feature-oriented-frontend.md)
- [**ADR-013: Feature-Based Backend Modules**](./adr/ADR-013-feature-based-backend-modules.md)
- [**ADR-014: Containerized Development Environment**](./adr/ADR-014-containerized-dev-environment.md)
- [**ADR-015: Ignore Local Files in Docker**](./adr/ADR-015-ignore-local-files-in-docker.md)
- [**ADR-016: Optimize Docker Layer Caching**](./adr/ADR-016-optimize-docker-layer-caching.md)

</details>

---

### 3. Business Modules Specs

Located in [`docs/modules/`](./modules):

- [**Authentication & Authorization Module**](./modules/auth.md) — *RBAC, JWT tokens, session handling*
- [**Population Registry Module**](./modules/population.md) — *Resident information management*
- [**Announcements Module**](./modules/announcement.md) — *Official municipal bulletins & statuses*

---

## 💡 Document Conventions

> [!TIP]
> - All new architecture decisions **must** follow the MADR format in `docs/adr/ADR-XXX.md`.
> - Diagramming uses standard [Mermaid syntax](https://mermaid.js.org/).
> - Shared types and domain schemas must be referenced from `packages/shared`.
