# ADR-003: Adopt REST API Architecture over GraphQL/gRPC

> **Status**: Accepted  
> **Date**: 2026-07-14  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

CivicOS frontend modules need to communicate with the Elysia backend server to execute municipal CRUD operations, process authentication, and fetch public bulletins. We must establish a standardized API paradigm for client-server communication.

---

## 🎯 Decision Drivers

- **Simplicity**: Standard HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) and HTTP status codes.
- **Caching & Tooling**: Seamless integration with TanStack Query and standard browser devtools.
- **Type Safety**: One JSON contract per resource, mirrored in the web app from the API's source of truth (ADR-028).

---

## 🔍 Considered Options

1. **GraphQL API**
2. **gRPC Web**
3. **RESTful HTTP API**

---

## ✅ Decision Outcome

**Chosen Option**: **Option 3 — RESTful HTTP API**.

CivicOS adopts a JSON-based REST API architecture over HTTP(S). Endpoints follow resource-oriented URLs (e.g., `/api/citizens`, `/api/announcements`) returning standardized JSON response envelopes (`{ success, data, message }`).

### Consequences & Trade-offs:

- **Pros**: Universally understood, easy to debug via browser network panel, simple integration with Elysia.js and TanStack Query.
- **Cons**: Potential over-fetching on complex relations (mitigated by tailored DTO responses).
