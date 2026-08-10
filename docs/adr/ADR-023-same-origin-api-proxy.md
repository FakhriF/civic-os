# ADR-023: Same-Origin API Access via Reverse Proxy (No CORS)

> **Status**: Accepted  
> **Date**: 2026-08-10  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

The web frontend (Vite dev server on `:5173`, later Nginx on `:80`/`:443`) and the API (Elysia on `:3000`) run on different origins. The auth flow relies on an HttpOnly cookie ([**ADR-022**](./ADR-022-jwt-session-management.md)), which requires credentials to be sent cross-origin. Cross-origin requests with credentials are blocked by browsers unless the API returns permissive CORS headers — an ongoing maintenance burden and a wider attack surface.

---

## 🎯 Decision Drivers

- **Cookie Security**: HttpOnly refresh cookies flow naturally in same-origin requests without `Access-Control-Allow-Credentials`.
- **Simplicity**: No per-route CORS configuration or preflight handling in the API.
- **Dev/Prod Parity**: Identical access pattern in development (Vite proxy) and production (Nginx reverse proxy).

---

## 🔍 Considered Options

1. **CORS in the API** (configure allowed origins + credentials)
2. **Same-Origin Reverse Proxy** (the frontend origin proxies `/api` to the backend)

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — Same-Origin Reverse Proxy**.

The browser only ever talks to the web origin; every `/api/*` request is proxied to the API:

- **Development**: the Vite dev server proxies `/api` using `VITE_API_PROXY_TARGET` (compose service `http://api:3000` in Docker, `http://localhost:3000` on the host).
- **Production**: an Nginx reverse proxy forwards `/api/*` to the API container.

### Consequences & Rules:

1. The API MUST NOT enable CORS; the proxy is the single access path.
2. Frontend requests use relative `/api/v1/*` URLs (or an env-provided absolute URL when deployed separately).
3. The proxy target MUST be configurable via environment (`VITE_API_PROXY_TARGET`), keeping Docker and host workflows identical.

### Consequences & Trade-offs:

- **Pros**:
  - HttpOnly cookies work without CORS credentials configuration.
  - Single origin reduces the CSRF surface (cookie scoped with `sameSite=strict`).
  - Dev/prod access patterns are identical.
- **Cons & Trade-offs**:
  - Requires a proxy in production (Nginx config), adding an infrastructure component.
  - Proxying hides the backend origin from the browser — network debugging needs proxy awareness.

---

## 📎 References

- [**ADR-014** Containerized Dev](./ADR-014-containerized-dev-environment.md) · [**ADR-017** Bind Mounts](./ADR-017-dev-containers-bind-mounts.md) · [**ADR-018** All Interfaces](./ADR-018-dev-servers-listen-all-interfaces.md) · [**ADR-022** JWT Session](./ADR-022-jwt-session-management.md)
- Implementation: `apps/web/vite.config.ts`, `docker-compose.yml`, planned `docker/nginx.conf`
