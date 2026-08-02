import { pgTable, pgEnum, serial, varchar, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { departments } from "./department";
import { users } from "./user";

export const statusEnum = pgEnum("status", ["draft", "published", "archived"]);

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: statusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
  departmentId: integer("department_id").references(() => departments.id).notNull(),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_announcements_department_id").on(table.departmentId),
  index("idx_announcements_status").on(table.status),
]);
