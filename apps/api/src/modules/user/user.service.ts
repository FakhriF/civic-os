import { eq } from "drizzle-orm";
import { departments, roles, users } from "../../database/schema";
import type { Database } from "../../database/client";

const userWithNames = {
  id: users.id,
  email: users.email,
  fullName: users.fullName,
  roleId: users.roleId,
  roleName: roles.name,
  departmentId: users.departmentId,
  departmentName: departments.name,
  isActive: users.isActive,
  createdAt: users.createdAt,
};

export class UserService {
  static async findAll(db: Database) {
    return db
      .select(userWithNames)
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(departments, eq(users.departmentId, departments.id))
      .orderBy(users.fullName);
  }

  static async findById(db: Database, id: number) {
    const [user] = await db
      .select(userWithNames)
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(departments, eq(users.departmentId, departments.id))
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }

  static async create(
    db: Database,
    input: {
      email: string;
      fullName: string;
      password: string;
      roleId: number;
      departmentId: number;
    },
  ) {
    const passwordHash = await Bun.password.hash(input.password);
    const [inserted] = await db
      .insert(users)
      .values({
        email: input.email,
        fullName: input.fullName,
        passwordHash,
        roleId: input.roleId,
        departmentId: input.departmentId,
      })
      .returning({ id: users.id });
    if (!inserted) return null;
    return UserService.findById(db, inserted.id);
  }

  static async update(
    db: Database,
    id: number,
    input: {
      fullName?: string;
      password?: string;
      roleId?: number;
      departmentId?: number;
      isActive?: boolean;
    },
  ) {
    const { password, ...profileFields } = input;
    const values: Partial<typeof users.$inferInsert> = { ...profileFields };

    if (password) {
      values.passwordHash = await Bun.password.hash(password);
    }

    const [updated] = await db
      .update(users)
      .set(values)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!updated) return null;
    return UserService.findById(db, updated.id);
  }
}
