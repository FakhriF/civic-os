import { beforeAll, describe, expect, test } from "bun:test";
import { api, login, resetDb } from "../../lib/test-helpers";

beforeAll(async () => {
  await resetDb();
});

describe("POST /api/v1/auth/login", () => {
  test("valid credentials return an access token", async () => {
    const res = await api("/api/v1/auth/login", {
      method: "POST",
      body: { email: "admin@civicos.test", password: "TestPass123!" },
    });
    expect(res.status).toBe(200);
    expect(typeof res.body?.data?.accessToken).toBe("string");
    expect(res.body?.data?.user?.email).toBe("admin@civicos.test");
    // The web app reads roleName to gate Admin-only UI (ADR-024 / ADR-028)
    expect(res.body?.data?.user?.roleName).toBe("Administrator");
  });

  test("wrong password is rejected", async () => {
    const res = await api("/api/v1/auth/login", {
      method: "POST",
      body: { email: "admin@civicos.test", password: "wrong-password" },
    });
    expect(res.status).toBe(401);
    expect(res.body?.error?.code).toBe("INVALID_CREDENTIALS");
  });

  test("unknown email is rejected with the same shape (no existence leak)", async () => {
    const res = await api("/api/v1/auth/login", {
      method: "POST",
      body: { email: "nobody@civicos.test", password: "TestPass123!" },
    });
    expect(res.status).toBe(401);
    expect(res.body?.error?.code).toBe("INVALID_CREDENTIALS");
    expect(res.body?.error?.message).toBe("Invalid email or password.");
  });

  test("disabled account is rejected", async () => {
    const res = await api("/api/v1/auth/login", {
      method: "POST",
      body: { email: "inactive@civicos.test", password: "TestPass123!" },
    });
    expect(res.status).toBe(401);
    expect(res.body?.error?.code).toBe("ACCOUNT_DISABLED");
  });

  test("malformed body returns 422", async () => {
    const res = await api("/api/v1/auth/login", {
      method: "POST",
      body: { email: "admin@civicos.test" }, // missing password
    });
    expect(res.status).toBe(422);
    expect(res.body?.error?.code).toBe("VALIDATION");
  });
});

describe("GET /api/v1/auth/me", () => {
  test("returns the current user with a valid token", async () => {
    const token = await login("admin@civicos.test");
    const res = await api("/api/v1/auth/me", { token });
    expect(res.status).toBe(200);
    expect(res.body?.data?.user?.email).toBe("admin@civicos.test");
    expect(res.body?.data?.user?.roleName).toBe("Administrator");
  });

  test("rejects missing token", async () => {
    const res = await api("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body?.error?.code).toBe("UNAUTHORIZED");
  });
});

describe("POST /api/v1/auth/refresh", () => {
  test("issues a new access token and preserves the role name", async () => {
    const loginRes = await api("/api/v1/auth/login", {
      method: "POST",
      body: { email: "admin@civicos.test", password: "TestPass123!" },
    });
    // Only the name=value pair belongs in the Cookie header; the Set-Cookie
    // attributes (Path, HttpOnly, ...) are not part of it.
    const cookie = loginRes.setCookie?.split(";")[0];
    expect(cookie).toContain("refreshToken=");

    const res = await api("/api/v1/auth/refresh", { method: "POST", cookie });
    expect(res.status).toBe(200);
    expect(typeof res.body?.data?.accessToken).toBe("string");
    // Regression guard: refresh used to drop roleName, which silently broke
    // Admin-only UI after a page reload.
    expect(res.body?.data?.user?.roleName).toBe("Administrator");
  });

  test("rejects a missing refresh cookie", async () => {
    const res = await api("/api/v1/auth/refresh", { method: "POST" });
    expect(res.status).toBe(401);
    expect(res.body?.error?.code).toBe("UNAUTHORIZED");
  });
});
