import { pgTable, serial, varchar, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { roles } from "./role";
import { departments } from "./department";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  roleId: integer("role_id").references(() => roles.id).notNull(),
  departmentId: integer("department_id").references(() => departments.id).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_users_role_id").on(table.roleId),
  index("idx_users_department_id").on(table.departmentId),
]);
