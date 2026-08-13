# Deploy — Design

> Implements: [./requirements.md](./requirements.md)
> Status: Draft

---

## 1. Runtime Fix: `dotenv` Becomes a Production Dependency (R1)

`apps/api/src/database/client.ts` imports `"dotenv/config"` at runtime, but `dotenv` currently lives in `devDependencies`. A production install with `--omit=dev` would crash the server on startup. Move `dotenv` to `dependencies` in `apps/api/package.json` (no code change).

---

## 2. Production API Image (R1)

New file `apps/api/Dockerfile.prod` — single stage, production-only install, no watch:

```dockerfile
FROM oven/bun:latest

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./

RUN bun install --omit=dev

COPY src ./src

EXPOSE 3000

CMD ["bun", "src/index.ts"]
```

- No build step needed — Bun executes TypeScript directly.
- No bind mounts (dev-only, ADR-017 does not apply to prod).
- The existing `Dockerfile` (dev, `--watch`) stays untouched for the dev compose.

---

## 3. Production Web Image + Nginx (R2, R3)

New file `apps/web/Dockerfile.prod` — multistage: build with Bun, serve with Nginx:

```dockerfile
FROM oven/bun:latest AS build

WORKDIR /app

COPY package.json ./

RUN bun install

COPY . .

RUN bun run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

New file `apps/web/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # API reverse proxy (ADR-023: single origin, no CORS)
    location /api/ {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback — client routes resolve to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Key details:

- `proxy_pass http://api:3000;` **without a trailing slash** — the original URI (`/api/v1/...`) is forwarded unchanged.
- `try_files ... /index.html` — direct navigation to `/users` etc. serves the SPA (R2).
- Refresh-token cookies flow through untouched (`Set-Cookie` is passed as-is; the browser only sees the web origin, per ADR-023).
- Nginx talks to the API over the compose network by service name (`api`).

---

## 4. Production Compose (R4)

New file `docker-compose.prod.yml`:

```yaml
services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.prod
    container_name: civicos-api-prod
    restart: unless-stopped
    environment:
      DATABASE_URL: ${DATABASE_URL}
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    depends_on:
      - postgres

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.prod
    container_name: civicos-web-prod
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - api

  postgres:
    image: postgres:18-alpine
    container_name: civicos-db-prod
    restart: unless-stopped
    ports:
      # Localhost-only: reachable from the host for migrate/seed/backup,
      # never exposed to the network
      - "127.0.0.1:5434:5432"
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql

volumes:
  postgres-data:
```

- API port `3000` is **not published** — only Nginx is reachable from the host (R3).
- Postgres is bound to **`127.0.0.1:5434` only** — the host can reach it for migrate/seed/backup (runbook), but it is never exposed to the network (R5).
- Secrets come from the environment (`.env`, per ADR-021); `docker-compose.prod.yml` contains no values.
- Data persists in the named volume `postgres-data` (R4).
- Dev `docker-compose.yml` is left untouched (ADR-019: incremental, one compose per concern).

---

## 5. Migration & Seed in Production (R5)

Not automated inside containers — explicit runbook steps executed from the host (which has the repo, Bun, and `drizzle-kit`):

```sh
# from apps/api, with the production .env exported:
DATABASE_URL=... bunx drizzle-kit migrate
DATABASE_URL=... bun run src/database/seed.ts   # sets SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD as needed
```

Rationale: migration is a deliberate, observable action; auto-migrate on container start can surprise (order, multiple instances, rollback).

---

## 6. Runbook

New file `docs/deployment.md` covering:

1. **Prerequisites**: VPS with Docker + Compose, git, Bun (for migrate/seed from host).
2. **Environment**: copy `.env.example` → `.env`; list of required variables (`DATABASE_URL`, `POSTGRES_*`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`).
3. **First deploy**: clone → `.env` → `docker compose -f docker-compose.prod.yml up -d --build` → migrate → seed → verify.
4. **Verify**: `curl http://<host>/` (SPA), `curl -X POST http://<host>/api/v1/auth/login` (proxy), `/health`.
5. **Updates**: `git pull` → `docker compose -f docker-compose.prod.yml up -d --build`.
6. **Backup**: `pg_dump` of the named volume.
7. **TLS (optional, not M8)**: Caddy/Traefik or certbot as a documented follow-up.

---

## 7. Non-Goals

- No TLS/HTTPS setup (documented as optional follow-up).
- No CI/CD pipeline.
- No actual VPS deployment (the runbook makes it a copy-paste exercise; deployment is a free-tier bonus step if desired).
- No changes to the dev workflow (`docker compose up` keeps working as today).
