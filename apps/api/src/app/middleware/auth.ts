import { Elysia } from "elysia";
import { jwtPlugin } from "../plugins/jwt";
import { roles, users } from "../../database/schema";
import { databasePlugin } from "../plugins/database";
import { eq } from "drizzle-orm";

export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .use(jwtPlugin)
  .use(databasePlugin)
  .derive({ as: "global" }, async ({ headers, jwtAccess, db, set }) => {
    const authHeader = headers.authorization || headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return {
        user: null,
      };
    }

    const token = authHeader.substring(7);
    const payload = await jwtAccess.verify(token);

    if (!payload || typeof payload !== "object" || !payload.sub) {
      set.status = 401;
      return {
        user: null,
      };
    }

    const userId = Number(payload.sub);

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        roleId: users.roleId,
        roleName: roles.name,
        departmentId: users.departmentId,
        isActive: users.isActive,
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.isActive) {
      set.status = 401;
      return {
        user: null,
      };
    }

    return {
      user: {
        id: userId,
        email: user.email,
        fullName: user.fullName,
        roleId: user.roleId,
        roleName: user.roleName,
        departmentId: user.departmentId,
      },
    };
  })
  .onBeforeHandle({ as: "global" }, ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return {
        status: "error",
        error: { code: "UNAUTHORIZED", message: "Unauthorized access" },
      };
    }
  });
