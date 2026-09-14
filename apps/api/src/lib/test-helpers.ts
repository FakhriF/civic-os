import { eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import { app } from "../app";
import { db } from "../database/client";
import { departments, roles, users } from "../database/schema";

// Deterministic baseline password for every seeded test user
export const TEST_PASSWORD = "TestPass123!";

let migrated = false;

// Apply the project's own migrations in-process (no bunx spawn), so tests
// always run against the real schema (specs/testing R2).
async function ensureMigrated() {
  if (migrated) return;
  await migrate(db, {
    migrationsFolder: path.resolve(import.meta.dir, "../database/migrations"),
  });
  migrated = true;
}

export interface ApiResult {
  status: number;
  body: {
    status?: string;
    data?: any;
    error?: { code?: string; message?: string };
  } | null;
  // Raw Set-Cookie header, when the endpoint issues one (e.g. login).
  setCookie?: string | null;
}

// Thin wrapper over Elysia's in-process request handling — no port needed
export async function api(
  path: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
    cookie?: string;
  } = {},
): Promise<ApiResult> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.cookie) headers.Cookie = options.cookie;

  const res = await app.handle(
    new Request(`http://localhost${path}`, {
      method: options.method ?? "GET",
      headers,
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
    }),
  );

  const text = await res.text();
  let body: ApiResult["body"] = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON body — leave as null
  }
  return { status: res.status, body, setCookie: res.headers.get("set-cookie") };
}

// End-to-end login through the real route; returns the access token.
// Fails fast with the server error when login does not succeed.
export async function login(
  email: string,
  password = TEST_PASSWORD,
): Promise<string> {
  const res = await api("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });
  const token = res.body?.data?.accessToken;
  if (typeof token !== "string") {
    throw new Error(
      `Login failed for ${email}: ${res.status} ${JSON.stringify(res.body?.error)}`,
    );
  }
  return token;
}

// Wipe application tables and rebuild the deterministic baseline
export async function resetDb() {
  await ensureMigrated();
  await db.execute(
    sql`TRUNCATE TABLE users, citizens, announcements RESTART IDENTITY CASCADE`,
  );
  await seedBaseline();
}

export async function seedBaseline() {
  await db
    .insert(roles)
    .values([
      { name: "Administrator", description: "Full access to the system" },
      {
        name: "Manager",
        description: "Departmental manager with approval authority",
      },
      {
        name: "Mayor",
        description: "Executive oversight and public reporting",
      },
      { name: "Officer", description: "Standard operational authority" },
    ])
    .onConflictDoNothing();

  await db
    .insert(departments)
    .values([
      {
        name: "Population",
        description: "Civil registry & citizen population management",
      },
      {
        name: "Public Relations",
        description: "Public announcements & citizen communications",
      },
    ])
    .onConflictDoNothing();

  const passwordHash = await Bun.password.hash(TEST_PASSWORD);

  const [adminRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, "Administrator"))
    .limit(1);
  const [managerRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, "Manager"))
    .limit(1);
  const [mayorRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, "Mayor"))
    .limit(1);
  const [officerRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, "Officer"))
    .limit(1);
  const [populationDept] = await db
    .select()
    .from(departments)
    .where(eq(departments.name, "Population"))
    .limit(1);

  await db
    .insert(users)
    .values([
      {
        email: "admin@civicos.test",
        fullName: "Test Admin",
        passwordHash,
        roleId: adminRole!.id,
        departmentId: populationDept!.id,
      },
      {
        email: "manager@civicos.test",
        fullName: "Test Manager",
        passwordHash,
        roleId: managerRole!.id,
        departmentId: populationDept!.id,
      },
      {
        email: "officer@civicos.test",
        fullName: "Test Officer",
        passwordHash,
        roleId: officerRole!.id,
        departmentId: populationDept!.id,
      },
      {
        email: "mayor@civicos.test",
        fullName: "Test Mayor",
        passwordHash,
        roleId: mayorRole!.id,
        departmentId: populationDept!.id,
      },
      {
        email: "inactive@civicos.test",
        fullName: "Inactive Officer",
        passwordHash,
        roleId: officerRole!.id,
        departmentId: populationDept!.id,
        isActive: false,
      },
    ])
    .onConflictDoNothing();
}

export async function roleIdByName(name: string) {
  const [role] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, name))
    .limit(1);
  return role?.id;
}

export async function departmentIdByName(name: string) {
  const [department] = await db
    .select()
    .from(departments)
    .where(eq(departments.name, name))
    .limit(1);
  return department?.id;
}
