# ADR-018: Development Servers Must Listen on All Interfaces

> **Status**: Accepted  
> **Date**: 2026-08-02  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

When frontend development servers (such as Vite in `apps/web`) run inside Docker containers, by default Vite binds to `127.0.0.1` (localhost inside the container loopback interface). This causes port forwarding mapping failures, preventing host machines and external browsers from reaching the containerized dev server.

---

## 🎯 Decision Drivers

- **Container Accessibility**: Ensure development servers running within Docker containers accept HTTP requests originating from the host machine browser.
- **Networking Parity**: Ensure consistent network exposure across Docker networks and local developer machines.
- **Developer Experience**: Prevent connection refused errors when accessing containerized frontend dev servers.

---

## 🔍 Considered Options

1. **Default Loopback Binding** (`vite` listening strictly on `127.0.0.1`)
2. **All Interfaces Binding** (`vite --host 0.0.0.0` listening on all container network interfaces)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — All Interfaces Binding**.

All development servers running inside Docker containers (`apps/web`, `apps/api`) MUST be configured to bind to all network interfaces (`0.0.0.0` or `--host` flag). For Vite (`apps/web`), the container start script uses `--host`:

```json
"scripts": {
  "dev": "vite --host 0.0.0.0"
}
```

Or via Vite configuration (`vite.config.ts`):
```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
```

### Consequences & Trade-offs:

- **Pros**:
  - Development server is immediately accessible from the host browser.
  - Fully compatible with Docker container port publishing (`5173:5173`).
  - Operates consistently across all local development environments.
- **Cons & Trade-offs**:
  - None for local containerized development.
