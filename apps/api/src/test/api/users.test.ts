import { beforeAll, describe, expect, test } from "bun:test";
import {
  api,
  departmentIdByName,
  login,
  resetDb,
  roleIdByName,
} from "../../lib/test-helpers";

beforeAll(async () => {
  await resetDb();
});

describe("GET /api/v1/users", () => {
  test("any authenticated user can list the directory", async () => {
    const token = await login("officer@civicos.test");
    const res = await api("/api/v1/users", { token });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.data)).toBe(true);
    expect(res.body?.data?.length).toBeGreaterThan(0);
  });

  test("rejects missing token", async () => {
    const res = await api("/api/v1/users");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/users", () => {
  test("non-admin is forbidden", async () => {
    const token = await login("officer@civicos.test");
    const officerRoleId = await roleIdByName("Officer");
    const populationDeptId = await departmentIdByName("Population");
    const res = await api("/api/v1/users", {
      method: "POST",
      token,
      body: {
        email: "blocked@civicos.test",
        fullName: "Blocked User",
        password: "Password123",
        roleId: officerRoleId,
        departmentId: populationDeptId,
      },
    });
    expect(res.status).toBe(403);
    expect(res.body?.error?.code).toBe("FORBIDDEN");
  });

  test("admin can create a user", async () => {
    const token = await login("admin@civicos.test");
    const officerRoleId = await roleIdByName("Officer");
    const populationDeptId = await departmentIdByName("Population");
    const res = await api("/api/v1/users", {
      method: "POST",
      token,
      body: {
        email: "new.user@civicos.test",
        fullName: "New User",
        password: "Password123",
        roleId: officerRoleId,
        departmentId: populationDeptId,
      },
    });
    expect(res.status).toBe(201);
    expect(res.body?.data?.email).toBe("new.user@civicos.test");
  });

  test("duplicate email returns 409", async () => {
    const token = await login("admin@civicos.test");
    const officerRoleId = await roleIdByName("Officer");
    const populationDeptId = await departmentIdByName("Population");
    const res = await api("/api/v1/users", {
      method: "POST",
      token,
      body: {
        email: "new.user@civicos.test",
        fullName: "Duplicate User",
        password: "Password123",
        roleId: officerRoleId,
        departmentId: populationDeptId,
      },
    });
    expect(res.status).toBe(409);
    expect(res.body?.error?.code).toBe("EMAIL_EXISTS");
  });
});

describe("PATCH /api/v1/users/:id", () => {
  test("non-admin is forbidden", async () => {
    const token = await login("officer@civicos.test");
    const res = await api("/api/v1/users/1", {
      method: "PATCH",
      token,
      body: { fullName: "Blocked Rename" },
    });
    expect(res.status).toBe(403);
    expect(res.body?.error?.code).toBe("FORBIDDEN");
  });

  test("cannot deactivate yourself", async () => {
    const token = await login("admin@civicos.test");
    const me = await api("/api/v1/auth/me", { token });
    const res = await api(`/api/v1/users/${me.body?.data?.user?.id}`, {
      method: "PATCH",
      token,
      body: { isActive: false },
    });
    expect(res.status).toBe(400);
    expect(res.body?.error?.code).toBe("SELF_DEACTIVATION");
  });

  test("unknown id returns 404", async () => {
    const token = await login("admin@civicos.test");
    const res = await api("/api/v1/users/99999", {
      method: "PATCH",
      token,
      body: { fullName: "Ghost" },
    });
    expect(res.status).toBe(404);
    expect(res.body?.error?.code).toBe("USER_NOT_FOUND");
  });
});
