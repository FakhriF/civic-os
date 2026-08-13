import { inArray } from "drizzle-orm";
import Elysia from "elysia";
import { roles } from "../../database/schema";
import { authMiddleware } from "./auth";
import { databasePlugin } from "../plugins/database";

// user holds at least one of the given roles.
export const requireRole = (...roleNames: string[]) =>
  new Elysia({ name: "require-role" })
    .use(databasePlugin)
    .use(authMiddleware)
    // as: "scoped" — the default 'local' scope would only apply to routes
    // inside this plugin (none); scoped reaches the parent's routes registered
    // after .use(requireRole(...))
    .onBeforeHandle({ as: "scoped" }, async ({ db, user, set }) => {
      if (!user) {
        set.status = 403;
        return {
          status: "error",
          error: { code: "FORBIDDEN", message: "Forbidden." },
        };
      }

      const allowed = await db
        .select({ id: roles.id })
        .from(roles)
        .where(inArray(roles.name, roleNames));

      if (!allowed.some((role) => role.id === user.roleId)) {
        set.status = 403;
        return {
          status: "error",
          error: { code: "FORBIDDEN", message: "Forbidden." },
        };
      }
    });
