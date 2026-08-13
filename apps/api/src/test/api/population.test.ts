import { beforeAll, describe, expect, test } from "bun:test";
import { api, login, resetDb } from "../../lib/test-helpers";

beforeAll(async () => {
  await resetDb();
});

const citizenBody = {
  nationalId: "3201010101010001",
  fullName: "Test Citizen",
  gender: "male",
  birthDate: "1990-01-01",
  address: "Jl. Merdeka No. 1",
  occupation: "Engineer",
};

function createCitizen(token: string, body = citizenBody) {
  return api("/api/v1/citizens", { method: "POST", token, body });
}

describe("GET /api/v1/citizens", () => {
  test("paginated list shape", async () => {
    const token = await login("officer@civicos.test");
    const res = await api("/api/v1/citizens", { token });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.data?.items)).toBe(true);
    expect(res.body?.data?.totalPages).toBeGreaterThanOrEqual(1);
  });

  test("rejects missing token", async () => {
    const res = await api("/api/v1/citizens");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/citizens", () => {
  test("officer can create a citizen", async () => {
    const token = await login("officer@civicos.test");
    const res = await createCitizen(token);
    expect(res.status).toBe(201);
    expect(res.body?.data?.nationalId).toBe(citizenBody.nationalId);
  });

  test("duplicate NIK returns 409", async () => {
    const token = await login("officer@civicos.test");
    const res = await createCitizen(token);
    expect(res.status).toBe(409);
    expect(res.body?.error?.code).toBe("CITIZEN_EXISTS");
  });

  test("mayor is forbidden from mutating", async () => {
    const token = await login("mayor@civicos.test");
    const res = await createCitizen(token, {
      ...citizenBody,
      nationalId: "3201010101010002",
    });
    expect(res.status).toBe(403);
    expect(res.body?.error?.code).toBe("FORBIDDEN");
  });
});

describe("search & filter", () => {
  test("search by NIK", async () => {
    const token = await login("officer@civicos.test");
    const res = await api(`/api/v1/citizens?search=${citizenBody.nationalId}`, {
      token,
    });
    expect(res.status).toBe(200);
    expect(res.body?.data?.items?.length).toBeGreaterThan(0);
    expect(res.body?.data?.items?.[0]?.nationalId).toBe(citizenBody.nationalId);
  });

  test("filter by gender", async () => {
    const token = await login("officer@civicos.test");
    const res = await api("/api/v1/citizens?gender=female", { token });
    expect(res.status).toBe(200);
    expect(
      res.body?.data?.items?.every(
        (citizen: { gender: string }) => citizen.gender === "female",
      ),
    ).toBe(true);
  });
});

describe("PATCH /api/v1/citizens/:id", () => {
  test("NIK is immutable", async () => {
    const token = await login("officer@civicos.test");
    const list = await api(
      `/api/v1/citizens?search=${citizenBody.nationalId}`,
      { token },
    );
    const id = list.body?.data?.items?.[0]?.id;
    const res = await api(`/api/v1/citizens/${id}`, {
      method: "PATCH",
      token,
      body: { fullName: "Renamed Citizen" },
    });
    expect(res.status).toBe(200);
    expect(res.body?.data?.fullName).toBe("Renamed Citizen");
    expect(res.body?.data?.nationalId).toBe(citizenBody.nationalId);
  });

  test("unknown id returns 404", async () => {
    const token = await login("officer@civicos.test");
    const res = await api("/api/v1/citizens/99999", {
      method: "PATCH",
      token,
      body: { fullName: "Ghost" },
    });
    expect(res.status).toBe(404);
    expect(res.body?.error?.code).toBe("CITIZEN_NOT_FOUND");
  });
});
