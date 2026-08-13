# ADR-025: Shared Query Hooks & Cross-Feature Cache

> **Status**: Accepted  
> **Date**: 2026-08-13  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

User Management (M5) defined `useRoleOptions` and `useDepartmentOptions` inside `features/users/use-users.ts` — fine while that feature was the only consumer. Announcements (M7) needs the same master data (department list for the tag filter and the form select). Two problems surfaced:

1. **Duplication risk**: copying the hooks into `features/announcement/` would duplicate query logic and cache keys; any change (new field, endpoint tweak) would need to be applied in N places.
2. **Stale cross-feature data**: the dashboard renders announcements (`RecentBulletins`). If it kept its own `useQuery(["announcements", "recent"])`, publishing or archiving on the Announcements page would not refresh the dashboard automatically.

---

## 🎯 Decision Drivers

- **Reuse over duplication**: the project rule "do not create a second implementation of something that already exists".
- **Master data is inherently cross-feature**: roles and departments are read by every module that assigns or filters by them.
- **TanStack Query caches by `queryKey`**: the same key prefix means a shared cache, and `invalidateQueries({ queryKey })` fans out to every consumer.
- **Feature files stay focused**: `use-users.ts` should only contain user-domain queries, not generic master-data lookups.

---

## 🔍 Considered Options

1. **Copy the hooks into each feature** that needs them — simple, but duplicates logic and cache keys; fixes drift over time.
2. **Extract shared master-data hooks to `src/lib/use-options.ts`** — one source of truth imported by any feature.
3. **Central "options registry" service/context** — premature abstraction for two endpoints.

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — shared hooks in `src/lib/`**.

`IdNameOption` + `useRoleOptions` + `useDepartmentOptions` live in `apps/web/src/lib/use-options.ts` and are imported by both `features/users` and `features/announcement` (`../../lib/use-options`). The old copies inside `features/users/use-users.ts` were removed.

**Second half — cross-feature cache**: a feature that renders a subset of another feature's data reuses that feature's hook instead of writing its own `useQuery`. `RecentBulletins` (dashboard) calls `useAnnouncements({ page: 1, limit: 5, status: "published" })`; because the hook's `queryKey` starts with `["announcements", ...]`, every announcement mutation's `invalidateQueries({ queryKey: ANNOUNCEMENTS_KEY })` also refreshes the dashboard widget — no extra wiring.

### Consequences & Rules:

1. **Shared hooks go in `src/lib/`**; feature-specific hooks stay in their feature folder. `lib/` now hosts shared hooks, not only pure utilities.
2. **Reuse the owning feature's hook for cross-feature data display** — never re-implement `useQuery` with a custom key for the same resource.
3. **Keep a shared `queryKey` prefix per resource** (e.g. `["announcements"]`) so invalidations fan out to all consumers.
4. **`placeholderData: keepPreviousData` lives inside list hooks** (not at each call site), so every consumer gets smooth pagination/filtering without focus loss.

### Consequences & Trade-offs:

- **Pros**:
  - Single source of truth for master-data queries.
  - Dashboard stays in sync automatically after publish/archive (verified in M7 manual testing).
  - Less duplicated code; new consumers add one import.
- **Cons & Trade-offs**:
  - `lib/` is no longer purely "utility functions" — the convention table in `project-structure.md` was updated to reflect shared hooks there.
  - Cross-feature cache coupling: a consumer's query shape is tied to the owning feature's hook signature (acceptable — it is the same resource).

---

## 📎 References

- [**ADR-012** Feature-Oriented Frontend](./ADR-012-feature-oriented-frontend.md) · [**ADR-005** Feature-Based Structure](./ADR-005-feature-based-structure.md)
- Implementation: `apps/web/src/lib/use-options.ts` · `apps/web/src/features/announcement/use-announcements.ts` · `apps/web/src/features/dashboard/recent-bulletins.tsx`
- Specification: [`specs/announcement/`](../../specs/announcement/)
