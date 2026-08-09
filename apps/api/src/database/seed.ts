import { eq } from "drizzle-orm";
import { db, pool } from "./client";
import { roles, departments, users } from "./schema";

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

  // 3. Seed default admin user (only if empty)
  console.log("👤 Seeding default admin user...");

  // Dev-only defaults — ALWAYS override via SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
  // before any real deployment (see .env.example).
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@civicos.dev";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "dev-admin-password-change-me";

  const [adminRole] = await db.select().from(roles).where(eq(roles.name, "Administrator")).limit(1);

  const [popDept] = await db.select().from(departments).where(eq(departments.name, "Population")).limit(1);

  const [existingUser] = await db.select().from(users).limit(1)

  if (adminRole && popDept && !existingUser) {
    const passwordHash = await Bun.password.hash(adminPassword)
    await db.insert(users).values({
      email: adminEmail,
      fullName: "System Administrator",
      passwordHash,
      roleId: adminRole.id,
      departmentId: popDept.id
    })
    console.log(`✅ Default admin user seeded! ${adminEmail}`)
  } else {
    console.log("⚠️ Default admin user already exists or roles/departments not seeded.")
  }

  console.log("✅ Database seeding completed successfully!");
    await pool.end();
    process.exit(0);
}

main().catch(async (error) => {
  console.error("❌ Error during seeding:", error);
  await pool.end();
  process.exit(1);
});
