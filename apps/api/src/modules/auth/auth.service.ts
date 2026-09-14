import { eq } from "drizzle-orm";
import { users, roles } from "../../database/schema";
import type { Database } from "../../database/client";

// Shared column selection for auth lookups. Includes passwordHash so
// validateUser can verify credentials; roleName comes from the roles join.
const authUserSelect = {
  id: users.id,
  email: users.email,
  fullName: users.fullName,
  passwordHash: users.passwordHash,
  roleId: users.roleId,
  roleName: roles.name,
  departmentId: users.departmentId,
  isActive: users.isActive,
};

export class AuthService {
  static async validateUser(
    db: Database,
    email: string,
    passwordAttempt: string,
  ) {
    const [user] = await db
      .select(authUserSelect)
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return null;

    if (!user.isActive) return { error: "ACCOUNT_DISABLED" };

    const isPasswordValid = await Bun.password.verify(
      passwordAttempt,
      user.passwordHash,
    );
    if (!isPasswordValid) return null;

    return { user };
  }

  static async findActiveUserById(db: Database, userId: number) {
    const [user] = await db
      .select(authUserSelect)
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.isActive) return null;

    return user;
  }
}
