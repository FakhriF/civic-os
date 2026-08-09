import { eq } from "drizzle-orm";
import { users } from "../../database/schema";

export class AuthService {
  static async validateUser(db: any, email: string, passwordAttempt: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) return null;

    if (!user.isActive) return { error: "ACCOUNT_DISABLED" }

    const isPasswordValid = await Bun.password.verify(passwordAttempt, user.passwordHash)
    if (!isPasswordValid) return null;

    return { user };
  }

  static async findActiveUserById(db: any, userId: number) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user || !user.isActive) return null;

    return user;
  }
}
