import Elysia from "elysia";
import { databasePlugin } from "../../app/plugins/database";
import { authMiddleware } from "../../app/middleware/auth";
import { announcements, departments, users } from "../../database/schema";
import { count, eq } from "drizzle-orm";

export const dashboardRoutes = new Elysia({ prefix: "/api/v1/dashboard" })
  .use(databasePlugin)
  .use(authMiddleware)
  .get("/stats", async ({ db }) => {
    const [totalUsers] = await db.select({ value: count() }).from(users);
    const [activeUsers] = await db
      .select({ value: count() })
      .from(users)
      .where(eq(users.isActive, true));
    const [totalDepartments] = await db
      .select({ value: count() })
      .from(departments);
    const [totalAnnouncements] = await db
      .select({ value: count() })
      .from(announcements);

    return {
      status: "success",
      data: {
        totalUsers: totalUsers.value,
        activeUsers: activeUsers.value,
        totalDepartments: totalDepartments.value,
        totalAnnouncements: totalAnnouncements.value,
      },
    };
  });
