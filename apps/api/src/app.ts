import { Elysia, ValidationError } from "elysia";
import { db } from "./database/client";
import { roles } from "./database/schema";
import { databasePlugin } from "./app/plugins/database";
import { authRoutes } from "./modules/auth/auth.routes";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes";
import { announcementRoutes } from "./modules/announcement/announcement.routes";
import { roleRoutes } from "./modules/role/role.routes";
import { departmentRoutes } from "./modules/department/department.routes";
import { userRoutes } from "./modules/user/user.routes";
import { populationRoutes } from "./modules/population/population.routes";

// App builder, exported without .listen() so tests can drive it
// in-process via app.handle() (see specs/testing).
export const app = new Elysia()
  .onError(({ error, set }) => {
    if (error instanceof ValidationError) {
      set.status = 422;
      return {
        status: "error",
        error: {
          code: "VALIDATION",
          message: error.all?.[0]?.message ?? "Invalid request body.",
        },
      };
    }
  })
  .use(databasePlugin)
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
  .use(authRoutes)
  .use(dashboardRoutes)
  .use(announcementRoutes)
  .use(populationRoutes)
  .use(roleRoutes)
  .use(departmentRoutes)
  .use(userRoutes);
