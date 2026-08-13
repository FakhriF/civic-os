# ADR-027: Production Build & Reverse Proxy

> **Status**: Accepted  
> **Date**: 2026-08-13  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

Until M8 the only Docker images were development images (`CMD ["bun", "run", "dev"]` — watch mode for the API, Vite dev server for the web app) used by `docker-compose.yml` with bind mounts (ADR-017). The MVP success criteria require the system to be *"deployable on a VPS using Docker Compose"*, and ADR-023 promised a production story ("Vite dev, Nginx prod") that was never written. Two concrete problems had to be solved:

1. **Dev images cannot run in production**: watch mode and Vite dev servers are not a production runtime, and shipping dev tooling bloats the image.
2. **The web origin needs a reverse proxy**: the SPA is static files, `/api/*` must reach the API, and the browser must only ever talk to a single origin (ADR-023).

---

## 🎯 Decision Drivers

- **MVP criterion**: deployable on a VPS with Docker Compose.
- **Keep dev and prod concerns separate**: dev workflow (bind mounts, HMR) must not leak into production, and vice versa.
- **Production-only images**: `bun install --omit=dev` — no compilers/test runners/migration tooling at runtime.
- **Single origin** (ADR-023): Nginx serves the SPA and proxies `/api`; the API port is not published to the host.
- **Explicit, observable operations**: migrations and seeding stay manual runbook steps, never automatic container-start side effects.

---

## 🔍 Considered Options

1. **Nginx container as the web service** (chosen) — classic, most common production topology for SPA + API on a VPS; the API container stays internal.
2. **Serve the SPA from the API process** — fewer containers, but couples static hosting to the backend and loses web-server features; also deviates from the ADR-023 plan.
3. **Managed PaaS (Vercel/Netlify/Render)** — zero server management, but contradicts the Docker + VPS MVP criterion.
4. **Caddy/Traefik instead of Nginx** — simpler config / auto-HTTPS, but Nginx was already committed in ADR-023 and is the most standard resume skill.

---

## ✅ Decision Outcome

**Chosen Option**: **Option 1 — dedicated production images + Nginx reverse proxy**.

### Architecture

- **`apps/api/Dockerfile.prod`**: single stage on `oven/bun`, `bun install --omit=dev`, `CMD ["bun", "src/index.ts"]` (Bun executes TypeScript directly; no build step). `dotenv` moved to `dependencies` so the runtime keeps loading `.env` (it was previously a dev-only dependency — a production crash).
- **`apps/web/Dockerfile.prod`**: multistage — Bun build stage runs `bun run build` (`tsc -b && vite build`), then `nginx:alpine` serves `/usr/share/nginx/html` with `nginx.conf`.
- **`apps/web/nginx.conf`**: `location /api/ { proxy_pass http://api:3000; }` (no trailing slash — original URI preserved) + `location / { try_files $uri $uri/ /index.html; }` (SPA fallback) + standard `X-Forwarded-*` headers. Refresh-token cookies flow through unchanged; the browser sees one origin.
- **`docker-compose.prod.yml`**: `api` (no published ports — internal only), `web` (Nginx, host port 80), `postgres` (named volume `postgres-data`). No bind mounts, secrets from the environment (ADR-021). The dev `docker-compose.yml` is untouched (ADR-019).
- **Operations**: `drizzle-kit migrate` and `db:seed` are documented manual steps in `docs/deployment.md`, executed from the host against the production `DATABASE_URL`.

### Consequences & Rules:

1. **Prod images are lean**: runtime contains only production dependencies; dev tooling lives in the dev image only.
2. **The API is never directly exposed** in production — Nginx is the only public entry point.
3. **SPA routes work on direct navigation** (`/users` → `index.html`), thanks to `try_files`.
4. **Migrate/seed are explicit runbook steps** — automatic migrations on container start are prohibited (surprising ordering, multi-instance races).
5. **TLS is a documented optional follow-up** (Caddy/Traefik/certbot in front of Nginx); no app changes required.

### Consequences & Trade-offs:

- **Pros**:
  - Standard, widely understood topology; single origin with no CORS.
  - Dev workflow unchanged; production verified locally (`docker compose -f docker-compose.prod.yml up`).
  - Rollout/rollback is a one-liner (`up -d --build` / `git checkout` + rebuild).
- **Cons & Trade-offs**:
  - One more moving part (Nginx config) to maintain — minimal at this scale.
  - Plain HTTP on port 80 until TLS is added (documented, not a blocker).

---

## 📎 References

- [**ADR-023** Same-Origin API Proxy](./ADR-023-same-origin-api-proxy.md) · [**ADR-021** Environment Configuration](./ADR-021-environment-configuration.md) · [**ADR-019** Incremental Docker Compose](./ADR-019-incremental-docker-compose.md) · [**ADR-017** Dev Containers Bind Mounts](./ADR-017-dev-containers-bind-mounts.md)
- Specification: [`specs/deploy/`](../../specs/deploy/)
- Implementation: `apps/api/Dockerfile.prod` · `apps/web/Dockerfile.prod` · `apps/web/nginx.conf` · `docker-compose.prod.yml` · `docs/deployment.md`
