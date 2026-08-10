import { Elysia } from "elysia";
import { jwtPlugin } from "../plugins/jwt";
import { users } from "../../database/schema";
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
      .select()
      .from(users)
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
        departmentId: user.departmentId,
      },
    };
  });
