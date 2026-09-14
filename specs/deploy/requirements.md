# Deploy — Requirements

> Implements M8 (Testing & Deploy) — second half
> Status: Complete

## R1 — Production API Image

The API SHALL have a production Docker image that runs the server without watch mode, with `NODE_ENV=production`, and without development tooling (compilers, test runners, migration tooling) inside the image.

### Acceptance Criteria

- `apps/api/Dockerfile.prod` builds successfully.
- The image starts `src/index.ts` directly (no `--watch`).
- The image contains only production dependencies (`bun install --omit=dev`).
- `dotenv` is available at runtime (moved from `devDependencies` to `dependencies`).

## R2 — Production Web Image

The web app SHALL have a production Docker image that builds the frontend (`tsc -b && vite build`) and serves the static output with Nginx, including SPA routing fallback.

### Acceptance Criteria

- `apps/web/Dockerfile.prod` builds the app and serves `dist/` from `nginx:alpine`.
- Navigating to a client route (e.g. `/users`) directly returns the SPA (`index.html`), not a 404.
- The dev Dockerfile and dev workflow remain untouched.

## R3 — Nginx Reverse Proxy

Nginx SHALL proxy `/api/*` requests to the API service so the browser only ever talks to a single origin (per ADR-023). This completes the "Nginx prod" story that ADR-023 deferred to production.

### Acceptance Criteria

- `location /api/` proxies to `http://api:3000` preserving the original URI.
- The API is NOT exposed directly to the host in the production compose (port `3000` is not published).
- Request/response headers required by the proxy (`Host`, `X-Forwarded-*`) are set.

## R4 — Production Compose

A `docker-compose.prod.yml` SHALL orchestrate the production stack: `api`, `web` (Nginx), and `postgres`. It SHALL NOT use development bind mounts, SHALL read secrets from the environment (`.env`), and SHALL persist database data in a named volume.

### Acceptance Criteria

- `docker compose -f docker-compose.prod.yml up -d --build` starts the full stack.
- The web service is reachable on port `80`.
- The development `docker-compose.yml` continues to work unchanged.
- No bind mounts of source code into production containers.

## R5 — Production Data Setup & Runbook

Database migration and seeding in production SHALL be documented and executable as explicit manual steps (not automatic on container start).

### Acceptance Criteria

- A deployment runbook (`docs/deployment.md`) exists covering: VPS prerequisites, environment setup, build & start, migrate, seed, verify, update strategy, and backup notes.
- The runbook commands use the project's existing mechanisms (`drizzle-kit migrate`, `db:seed`).
- TLS/HTTPS is documented as an optional follow-up (not a blocker for M8).

## R6 — Verification

The deploy work is complete only when the production stack is verified locally AND existing checks still pass.

### Acceptance Criteria

- `docker compose -f docker-compose.prod.yml up -d --build` succeeds.
- `curl http://localhost/` returns the SPA HTML.
- Login flow works through the Nginx proxy (`POST http://localhost/api/v1/auth/login`).
- `bun test`, `tsc` (api + web), and `bun run lint` remain green.
- The development stack (`docker compose up`) still works.
