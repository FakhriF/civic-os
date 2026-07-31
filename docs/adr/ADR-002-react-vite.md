# ADR-002: Adopt React + Vite for Web Frontend

> **Status**: Accepted  
> **Date**: 2026-07-12  
> **Deciders**: CivicOS Architecture Team  

---

## 📌 Context & Problem Statement

The CivicOS frontend requires a modern, responsive Single Page Application (SPA) framework capable of handling complex admin dashboards, data tables, and interactive municipal workflows with instant development server feedback.

---

## 🎯 Decision Drivers

- **Build Performance**: Lightning-fast Cold Start & Hot Module Replacement (HMR) during local development.
- **Ecosystem & Community**: Broad ecosystem support for component libraries (Mantine) and query management (TanStack Query).
- **Bundle Optimization**: Efficient production bundling via Rollup/Esbuild.

---

## 🔍 Considered Options

1. **React + Vite (Single Page Application SPA)**
2. **Vue.js + Vite**

---

## ✅ Decision Outcome

**Chosen Option**: **Option 2 — React + Vite**.

CivicOS frontend (`apps/web`) is built as a React SPA powered by Vite. Since CivicOS is primarily an internal government administration application (behind authentication), Client-Side Rendering (CSR) with Vite provides fast build times and straightforward SPA routing without the complexity of SSR.

### Consequences & Trade-offs:

- **Pros**: Sub-second dev server startup, rapid HMR feedback, simpler deployment as static assets behind Nginx.
- **Cons**: Initial JS payload must be loaded on cold visit (mitigated by route-level code splitting).
