# 🗄️ Database Architecture & Entity Specifications

> **Engine**: PostgreSQL 16+  
> **ORM**: Drizzle ORM  
> **Schema Management**: Declarative TypeScript Schemas & Automated Drizzle Migrations  

---

## 📊 Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    ROLE ||--o{ USER : "assigned to"
    DEPARTMENT ||--o{ USER : "employs"
    USER ||--o{ ANNOUNCEMENT : "creates / publishes"
    USER ||--o{ CITIZEN : "creates / updates"
    DEPARTMENT ||--o{ ANNOUNCEMENT : "sponsors"

    ROLE {
        serial id PK
        varchar name UK
        text description
        timestamp createdAt
    }

    DEPARTMENT {
        serial id PK
        varchar name UK
        text description
        timestamp createdAt
    }

    USER {
        serial id PK
        varchar email UK
        varchar passwordHash
        varchar fullName
        integer roleId FK
        integer departmentId FK
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    CITIZEN {
        serial id PK
        varchar nationalId UK
        varchar fullName
        enum gender
        date birthDate
        text address
        varchar occupation
        integer createdById FK
        integer updatedById FK
        timestamp createdAt
        timestamp updatedAt
    }

    ANNOUNCEMENT {
        serial id PK
        varchar title
        text content
        enum status
        timestamp publishedAt
        integer departmentId FK
        integer createdById FK
        timestamp createdAt
        timestamp updatedAt
    }
```

---

## 📋 Entity Data Dictionary

### 1. `users` (System Accounts)

Represents municipal employees, officers, department heads, and administrators accessing CivicOS.

| Field | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing user account identifier |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | Official work email address |
| `passwordHash` | `VARCHAR(255)` | `NOT NULL` | Argon2id / bcrypt hashed password string |
| `fullName` | `VARCHAR(150)` | `NOT NULL` | Employee full display name |
| `roleId` | `INTEGER` | `NOT NULL`, `FK -> roles(id)` | Foreign key referencing assigned system role |
| `departmentId` | `INTEGER` | `NOT NULL`, `FK -> departments(id)` | Foreign key referencing assigned department |
| `isActive` | `BOOLEAN` | `NOT NULL`, Default `true` | Account activation status flag ([**ADR-020**](./adr/ADR-020-soft-delete-user-accounts.md)) |
| `createdAt` | `TIMESTAMP` | `NOT NULL`, Default `NOW()` | Record creation timestamp |
| `updatedAt` | `TIMESTAMP` | `NOT NULL`, Default `NOW()` | Record last modification timestamp |

---

### 2. `roles` (Access Permissions)

Defines Role-Based Access Control (RBAC) levels across CivicOS.

| Field | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing role identifier |
| `name` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Role name (`Officer`, `Manager`, `Administrator`, `Mayor`) |
| `description` | `TEXT` | `NULLABLE` | Human-readable explanation of permissions |
| `createdAt` | `TIMESTAMP` | `NOT NULL`, Default `NOW()` | Record creation timestamp |

---

### 3. `departments` (Municipal Departments)

Represents government divisions (e.g., Population, Finance, Transportation, Public Relations).

| Field | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing department identifier |
| `name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Department title |
| `description` | `TEXT` | `NULLABLE` | Function & scope description |
| `createdAt` | `TIMESTAMP` | `NOT NULL`, Default `NOW()` | Record creation timestamp |

---

### 4. `citizens` (Population Registry)

Stores demographic records managed by the Population Department.

| Field | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing citizen record identifier |
| `nationalId` | `VARCHAR(20)` | `NOT NULL`, `UNIQUE` | National identification number (NIK / SSN) |
| `fullName` | `VARCHAR(150)` | `NOT NULL` | Legal full name |
| `gender` | `PG_ENUM` | `NOT NULL` (`male`, `female`, `other`) | Gender identity classification |
| `birthDate` | `DATE` | `NOT NULL` | Date of birth |
| `address` | `TEXT` | `NOT NULL` | Primary residential address |
| `occupation` | `VARCHAR(100)` | `NOT NULL` | Current primary occupation |
| `createdById` | `INTEGER` | `NOT NULL`, `FK -> users(id)` | User who registered this citizen record |
| `updatedById` | `INTEGER` | `NOT NULL`, `FK -> users(id)` | User who last updated this citizen record |
| `createdAt` | `TIMESTAMP` | `NOT NULL`, Default `NOW()` | Record creation timestamp |
| `updatedAt` | `TIMESTAMP` | `NOT NULL`, Default `NOW()` | Record last update timestamp |

---

### 5. `announcements` (Public Bulletins)

Stores government announcements published through CivicOS.

| Field | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing announcement identifier |
| `title` | `VARCHAR(255)` | `NOT NULL` | Bulletin title header |
| `content` | `TEXT` | `NOT NULL` | Body content (Markdown format supported) |
| `status` | `PG_ENUM` | `NOT NULL`, Default `'draft'` (`draft`, `published`, `archived`) | Publication workflow state |
| `publishedAt` | `TIMESTAMP` | `NOT NULL`, Default `NOW()` | Timestamp when published to public |
| `departmentId` | `INTEGER` | `NOT NULL`, `FK -> departments(id)` | Publishing department |
| `createdById` | `INTEGER` | `NOT NULL`, `FK -> users(id)` | Author user account |
| `createdAt` | `TIMESTAMP` | `NOT NULL`, Default `NOW()` | Creation timestamp |
| `updatedAt` | `TIMESTAMP` | `NOT NULL`, Default `NOW()` | Last modification timestamp |

---

## 🔒 Database Indexing & Performance Rules

1. **Foreign Key Indexes**: B-Tree indexes are created on foreign keys (`idx_users_role_id`, `idx_users_department_id`, `idx_citizens_created_by`, `idx_announcements_department_id`) to optimize `JOIN` execution.
2. **Search Indexing**: B-Tree index `idx_citizens_full_name` on `citizens.fullName` for rapid citizen search queries.
3. **Workflow Filtering**: B-Tree index `idx_announcements_status` on `announcements.status` for fast public feed queries.
4. **Audit Trail Accountability**: High-stakes tables (`citizens`, `announcements`) record `createdById` and `updatedById` to enforce complete operational accountability.