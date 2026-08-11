import Elysia from "elysia";
import { databasePlugin } from "../../app/plugins/database";
import { authMiddleware } from "../../app/middleware/auth";
import { roles } from "../../database/schema";

export const roleRoutes = new Elysia({ prefix: "/api/v1/roles" })
  .use(databasePlugin)
  .use(authMiddleware)
  .get("/", async ({ db }) => {
    const items = await db.select().from(roles);
    return { status: "success", data: items };
  });
