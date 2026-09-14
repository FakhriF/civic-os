# 👥 Module Specification: Population Registry

> **Module Name**: `population`  
> **Backend Path**: `apps/api/src/modules/population`  
> **Frontend Path**: `apps/web/src/features/population`  
> 📄 **Detailed feature specification**: [`specs/population/`](../../specs/population/) (requirements, design, tasks)  

---

## 📌 Functional Requirements

1. **Citizen Registration**: Capture and validate resident details (National ID, Full Name, Gender, Birth Date, Address, Occupation).
2. **Citizen Search & Filter**: Instant search by National ID or Full Name with paginated results.
3. **Record Management**: Update citizen information with automatic `updatedById` and timestamp audit tracking.

---

## 🔌 API Contracts

| Method  | Endpoint               | Access Level              | Description                                                    |
| :------ | :--------------------- | :------------------------ | :------------------------------------------------------------- |
| `GET`   | `/api/v1/citizens`     | Authenticated             | Paginated list with `search` and `gender` filters              |
| `GET`   | `/api/v1/citizens/:id` | Authenticated             | Retrieve a single citizen record                               |
| `POST`  | `/api/v1/citizens`     | Officer / Manager / Admin | Register a citizen (audited with `createdById`)                |
| `PATCH` | `/api/v1/citizens/:id` | Officer / Manager / Admin | Update a citizen record (audited with `updatedById`)           |

### Record Lifecycle

- There is **no delete endpoint**: citizen records are never hard-deleted. Soft-voiding (`isVoided` + `voidedById`/`voidedAt`) is deferred and tracked in the roadmap backlog.
- The National ID is unique; registering a duplicate returns `409 CITIZEN_EXISTS`.
- Unknown ids return `404 CITIZEN_NOT_FOUND`; an empty `PATCH` returns `400 EMPTY_UPDATE`.
