import { beforeAll, describe, expect, test } from "bun:test";
import {
  api,
  departmentIdByName,
  login,
  resetDb,
} from "../../lib/test-helpers";

beforeAll(async () => {
  await resetDb();
});

async function announcementBody() {
  return {
    title: "Test Announcement",
    content: "This is the content of the announcement.",
    departmentId: await departmentIdByName("Public Relations"),
  };
}

async function createAnnouncement(token: string) {
  return api("/api/v1/announcements", {
    method: "POST",
    token,
    body: await announcementBody(),
  });
}

describe("GET /api/v1/announcements", () => {
  test("paginated list with status filter", async () => {
    const token = await login("officer@civicos.test");
    const res = await api("/api/v1/announcements?status=draft", { token });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body?.data?.items)).toBe(true);
  });

  test("rejects missing token", async () => {
    const res = await api("/api/v1/announcements");
    expect(res.status).toBe(401);
  });
});

describe("create → publish → archive → republish", () => {
  test("create lands as draft", async () => {
    const token = await login("officer@civicos.test");
    const res = await createAnnouncement(token);
    expect(res.status).toBe(201);
    expect(res.body?.data?.status).toBe("draft");
  });

  test("publish a draft", async () => {
    const token = await login("officer@civicos.test");
    const created = await createAnnouncement(token);
    const id = created.body?.data?.id;
    const res = await api(`/api/v1/announcements/${id}/publish`, {
      method: "POST",
      token,
    });
    expect(res.status).toBe(200);
    expect(res.body?.data?.status).toBe("published");
    expect(typeof res.body?.data?.publishedAt).toBe("string");
  });

  test("cannot publish an already published announcement", async () => {
    const token = await login("officer@civicos.test");
    const created = await createAnnouncement(token);
    const id = created.body?.data?.id;
    await api(`/api/v1/announcements/${id}/publish`, { method: "POST", token });
    const res = await api(`/api/v1/announcements/${id}/publish`, {
      method: "POST",
      token,
    });
    expect(res.status).toBe(400);
    expect(res.body?.error?.code).toBe("INVALID_STATUS_TRANSITION");
  });

  test("archive a published announcement", async () => {
    const token = await login("officer@civicos.test");
    const created = await createAnnouncement(token);
    const id = created.body?.data?.id;
    await api(`/api/v1/announcements/${id}/publish`, { method: "POST", token });
    const res = await api(`/api/v1/announcements/${id}/archive`, {
      method: "POST",
      token,
    });
    expect(res.status).toBe(200);
    expect(res.body?.data?.status).toBe("archived");
  });

  test("cannot archive a draft", async () => {
    const token = await login("officer@civicos.test");
    const created = await createAnnouncement(token);
    const id = created.body?.data?.id;
    const res = await api(`/api/v1/announcements/${id}/archive`, {
      method: "POST",
      token,
    });
    expect(res.status).toBe(400);
    expect(res.body?.error?.code).toBe("INVALID_STATUS_TRANSITION");
  });

  test("republish an archived announcement", async () => {
    const token = await login("officer@civicos.test");
    const created = await createAnnouncement(token);
    const id = created.body?.data?.id;
    await api(`/api/v1/announcements/${id}/publish`, { method: "POST", token });
    await api(`/api/v1/announcements/${id}/archive`, { method: "POST", token });
    const res = await api(`/api/v1/announcements/${id}/publish`, {
      method: "POST",
      token,
    });
    expect(res.status).toBe(200);
    expect(res.body?.data?.status).toBe("published");
  });
});

describe("RBAC & 404s", () => {
  test("mayor is forbidden from creating", async () => {
    const token = await login("mayor@civicos.test");
    const res = await createAnnouncement(token);
    expect(res.status).toBe(403);
    expect(res.body?.error?.code).toBe("FORBIDDEN");
  });

  test("unknown announcement detail returns 404", async () => {
    const token = await login("officer@civicos.test");
    const res = await api("/api/v1/announcements/99999", { token });
    expect(res.status).toBe(404);
    expect(res.body?.error?.code).toBe("ANNOUNCEMENT_NOT_FOUND");
  });

  test("publish unknown announcement returns 404", async () => {
    const token = await login("officer@civicos.test");
    const res = await api("/api/v1/announcements/99999/publish", {
      method: "POST",
      token,
    });
    expect(res.status).toBe(404);
    expect(res.body?.error?.code).toBe("ANNOUNCEMENT_NOT_FOUND");
  });

  test("update unknown announcement returns 404", async () => {
    const token = await login("officer@civicos.test");
    const res = await api("/api/v1/announcements/99999", {
      method: "PATCH",
      token,
      body: { title: "Renamed" },
    });
    expect(res.status).toBe(404);
    expect(res.body?.error?.code).toBe("ANNOUNCEMENT_NOT_FOUND");
  });
});
