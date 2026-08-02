import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: "../../.env",
});

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schema/index.ts",
  out: "./src/database/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://civicos_admin:civicos_dev_password@localhost:5432/civicos_db",
  },
});
