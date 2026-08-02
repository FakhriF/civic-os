import { pgTable, pgEnum, serial, varchar, text, date, integer, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./user";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const citizens = pgTable("citizens", {
  id: serial("id").primaryKey(),
  nationalId: varchar("national_id", { length: 20 }).notNull().unique(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  gender: genderEnum("gender").notNull(),
  birthDate: date("birth_date").notNull(),
  address: text("address").notNull(),
  occupation: varchar("occupation", { length: 100 }).notNull(),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  updatedById: integer("updated_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("idx_citizens_full_name").on(table.fullName),
  index("idx_citizens_created_by").on(table.createdById),
]);
