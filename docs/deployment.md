# 🚀 CivicOS Deployment Runbook

> Production deployment guide for the Docker Compose stack (M8). Mirrors `docker-compose.prod.yml` and follows ADR-021 (env config) and ADR-023 (single-origin Nginx proxy).

---

## 1. Prerequisites

- A Linux VPS with **Docker Engine + Compose plugin** installed.
- **Git** (to clone the repo).
- **Bun** installed on the host — only needed for the one-off migration/seed steps (Bun ≥ 1.x).
- Port **80** open (HTTP). TLS is optional and documented at the end.

---

## 2. Environment Configuration

Copy the example file and fill in real values:

```sh
cp .env.example .env
```

Required variables (see `.env.example` for descriptions):

| Variable                                              | Purpose                                                    |
| :---------------------------------------------------- | :--------------------------------------------------------- |
| `DATABASE_URL`                                        | Postgres connection string used by the API                 |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Credentials for the prod Postgres container                |
| `JWT_SECRET`                                          | Access-token signing secret — use a long random value      |
| `JWT_REFRESH_SECRET`                                  | Refresh-token signing secret — different from `JWT_SECRET` |
| `NODE_ENV`                                            | Set to `production`                                        |

> 🔐 Secrets never go into git. `docker-compose.prod.yml` reads them from the environment only (ADR-021).

---

## 3. First Deploy

```sh
git clone <repo-url> civicos
cd civicos
# create .env as above

docker compose -f docker-compose.prod.yml up -d --build
```

This builds both production images (`Dockerfile.prod`) and starts `api`, `web` (Nginx on port 80), and `postgres`. The API port is **not** exposed to the host — only Nginx is reachable (ADR-023).

---

## 4. Migrate & Seed

Run from the host (the repo checkout), pointing at the production database.
The prod Postgres is bound to **localhost:5434** (see `docker-compose.prod.yml`) so the host can reach it for admin tasks while it stays private from the network:

```sh
cd apps/api

# apply schema migrations
DATABASE_URL=postgres://<user>:<password>@127.0.0.1:5434/<db> bunx drizzle-kit migrate

# seed roles/departments/default admin (idempotent)
DATABASE_URL=postgres://<user>:<password>@127.0.0.1:5434/<db> \
  SEED_ADMIN_EMAIL=admin@your.domain \
  SEED_ADMIN_PASSWORD='a-strong-initial-password' \
  bun run src/database/seed.ts
```

`<user>/<password>/<db>` match the `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` values in your `.env`.

---

## 5. Verify

```sh
# SPA is served
curl -I http://<host>/

# API is reachable through the Nginx proxy
curl -X POST http://<host>/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@your.domain","password":"..."}'

# health check
curl -s http://<host>/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

Expected: `login` returns an access token; the SPA returns HTML with a 200.

---

## 6. Updating

```sh
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

If the update includes **schema changes**, run step 4 (migrate) before or right after, per your change window. Old containers are replaced with `--build`; data persists in the named volume.

---

## 7. Backup

```sh
# dump the prod database (localhost-only port 5434)
pg_dump postgres://<user>:<password>@127.0.0.1:5434/<db> > backup-$(date +%F).sql

# restore on a fresh machine
psql postgres://<user>:<password>@127.0.0.1:5434/<db> < backup.sql
```

---

## 8. TLS / HTTPS (Optional — not part of M8)

The stack is plain HTTP on port 80. For production use, terminate TLS in front of Nginx. Recommended (no changes to the app):

- **Caddy** or **Traefik** as a second reverse proxy with automatic HTTPS, or
- **certbot** against the existing Nginx container.

The app itself is origin-agnostic: cookies use `sameSite: "strict"` and the SPA talks only to its own origin, so HTTPS needs no application changes (ADR-023).

---

## 9. Rollback

The previous images remain tagged locally after a rebuild:

```sh
docker compose -f docker-compose.prod.yml up -d --no-build   # keeps current images
# or, to roll back code: git checkout <previous-tag> && docker compose ... up -d --build
```
