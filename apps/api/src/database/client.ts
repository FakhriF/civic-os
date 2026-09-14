import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "dotenv";
import path from "node:path";

const envPath = path.resolve(import.meta.dir, "../../../../.env.local");
config({ path: envPath });

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
export const db = drizzle({ client: pool });

// The concrete Drizzle client type, so services can be typed without `any`.
export type Database = typeof db;
