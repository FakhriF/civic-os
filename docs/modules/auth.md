# 🔐 Module Specification: Authentication & Authorization

> **Module Name**: `auth`  
> **Backend Path**: `apps/api/src/modules/auth`  
> **Frontend Path**: `apps/web/src/features/authentication`  
> 📄 **Detailed feature specification**: [`specs/auth/`](../../specs/auth/) (requirements, design, tasks)

---

## 📌 Functional Requirements

1. **User Authentication**: Secure email and password login generating JWT session tokens.
2. **Role-Based Access Control (RBAC)**: Enforce permission boundaries across roles (`Officer`, `Manager`, `Administrator`, `Mayor`).
3. **Session Management**: Session verification, token refresh, and secure logout.

---

## 🔌 API Contracts

| Method | Endpoint               | Access Level            | Description                                                |
| :----- | :--------------------- | :---------------------- | :--------------------------------------------------------- |
| `POST` | `/api/v1/auth/login`   | Public                  | Authenticates credentials and returns JWT bearer token     |
| `POST` | `/api/v1/auth/refresh` | Public (cookie)         | Issues a new access token from the refresh cookie          |
| `POST` | `/api/v1/auth/logout`  | Public (cookie removal) | Invalidates user session token                             |
| `GET`  | `/api/v1/auth/me`      | Authenticated           | Returns currently authenticated user profile & permissions |
