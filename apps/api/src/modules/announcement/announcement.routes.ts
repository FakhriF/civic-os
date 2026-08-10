import Elysia from "elysia";
import { desc, eq } from "drizzle-orm";
import { authMiddleware } from "../../app/middleware/auth";
import { databasePlugin } from "../../app/plugins/database";
import { announcements } from "../../database/schema";

export const announcementRoutes = new Elysia({
  prefix: "/api/v1/announcements",
})
  .use(databasePlugin)
  .use(authMiddleware)
  // Read-only slice for the dashboard — full CRUD lands with M7
  .get("/", async ({ db, query }) => {
    const limit = Math.min(Number(query.limit ?? 5), 20);

    const items = await db
      .select()
      .from(announcements)
      .where(eq(announcements.status, "published"))
      .orderBy(desc(announcements.publishedAt))
      .limit(limit);

    return { status: "success", data: items };
  });
