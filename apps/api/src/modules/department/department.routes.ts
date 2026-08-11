import Elysia from "elysia";
import { databasePlugin } from "../../app/plugins/database";
import { authMiddleware } from "../../app/middleware/auth";
import { departments } from "../../database/schema";

export const departmentRoutes = new Elysia({ prefix: "/api/v1/departments" })
  .use(databasePlugin)
  .use(authMiddleware)
  .get("/", async ({ db }) => {
    const items = await db.select().from(departments);
    return { status: "success", data: items };
  });
