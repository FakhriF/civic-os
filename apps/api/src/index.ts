import { Elysia } from "elysia";
import { db } from "./database/client";
import { roles } from "./database/schema";
import { databasePlugin } from "./app/plugins/database";
import { authRoutes } from "./modules/auth/auth.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";

const app = new Elysia()
  .use(databasePlugin)
  .use(authRoutes)
  .use(dashboardRoutes)
  .get("/health", async ({ set }) => {
    try {
      const [sampleRole] = await db.select().from(roles).limit(1);

      return {
        status: "ok",
        database: "connected",
        sampleRole,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      set.status = 503;
      console.error("Health check DB Error", error);

      return {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  })
  .get("/", () => "Hello CivicOS")
  .listen(3000);

console.log(
  `CivicOS is running at ${app.server?.hostname}:${app.server?.port}`,
);
