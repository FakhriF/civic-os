# Deploy — Tasks

> Implements: [./design.md](./design.md)
> Status: Complete

Every task references the requirement ID(s) it implements. The feature is only ready for verification when every requirement R1..R6 has at least one task.

## Runtime & Images

- [x] Move `dotenv` from `devDependencies` to `dependencies` in `apps/api/package.json` (R1)
- [x] Write `apps/api/Dockerfile.prod` — single stage, `bun install --omit=dev`, `CMD ["bun", "src/index.ts"]` (R1)
- [x] Write `apps/web/Dockerfile.prod` — multistage `vite build` → `nginx:alpine` (R2)
- [x] Write `apps/web/nginx.conf` — SPA fallback + `/api` proxy to `http://api:3000` (R2, R3)

## Orchestration

- [x] Write `docker-compose.prod.yml` — api + web(nginx, port 80) + postgres, no bind mounts, env-driven, dedicated project name `civicos-prod` (R3, R4)

## Documentation

- [x] Write deploy runbook `docs/deployment.md` — prerequisites, env, first deploy, migrate+seed, verify, updates, backup, TLS notes (R5)
- [x] Add ADR-027 "Production Build & Reverse Proxy" + register in `docs/adr/README.md` (wrap-up)

## Verification

- [x] `docker compose -f docker-compose.prod.yml up -d --build` succeeds (R6)
- [x] `curl http://localhost/` returns SPA HTML; direct client route (e.g. `/users`) returns SPA, not 404 (R2, R6)
- [x] Login flow works through the proxy: `POST http://localhost/api/v1/auth/login` (R3, R6)
- [x] `bun test`, `tsc` (api + web), `bun run lint` stay green (R6)
- [x] Dev stack (`docker compose up`) still works unchanged (R4, R6)
- [x] Update `docs/roadmap.md`: M8 → `Completed` 🟢, v1.0 → `Completed` 🟢 (wrap-up)
