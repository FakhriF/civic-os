# 👥 Module Specification: Population Registry

> **Module Name**: `population`  
> **Backend Path**: `apps/api/src/modules/population`  
> **Frontend Path**: `apps/web/src/features/population`  

---

## 📌 Functional Requirements

1. **Citizen Registration**: Capture and validate resident details (National ID, Full Name, Gender, Birth Date, Address, Occupation).
2. **Citizen Search & Filter**: Instant search by National ID or Full Name with paginated results.
3. **Record Management**: Update citizen information with automatic `updatedById` and timestamp audit tracking.

---

## 🔌 API Contracts

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/citizens` | Officer+ | Fetch paginated list of citizen records |
| `POST` | `/api/citizens` | Officer+ | Register a new citizen in the population database |
| `GET` | `/api/citizens/:id` | Officer+ | Retrieve detailed record for a specific citizen |
| `PUT` | `/api/citizens/:id` | Officer+ | Update existing citizen record |
| `DELETE` | `/api/citizens/:id` | Manager+ | Soft-delete / archive citizen record |
