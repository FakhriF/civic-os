import { db, pool } from "./client";
import { roles, departments } from "./schema";

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Roles
  console.log("📦 Seeding roles...");
  await db.insert(roles).values([
    { name: "Administrator", description: "Full access to the system" },
    { name: "Manager", description: "Departmental manager with approval authority" },
    { name: "Mayor", description: "Executive oversight and public reporting view" },
    { name: "Officer", description: "Standard operational authority" },
  ]).onConflictDoNothing();

  // 2. Seed Departments
  console.log("🏢 Seeding departments...");
  await db.insert(departments).values([
    { name: "Population", description: "Civil registry & citizen population management" },
    { name: "Public Relations", description: "Public announcements & citizen communications" },
  ]).onConflictDoNothing();

  console.log("✅ Database seeding completed successfully!");
    await pool.end();
    process.exit(0);
}

main().catch(async (error) => {
  console.error("❌ Error during seeding:", error);
  await pool.end();
  process.exit(1);
});
