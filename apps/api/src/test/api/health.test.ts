import { describe, expect, it } from "bun:test";
import { api } from "../../lib/test-helpers";

describe("public endpoints", () => {
  it("GET /health is reachable without a token", async () => {
    const res = await api("/health");
    expect(res.status).toBe(200);
    expect(res.body?.status).toBe("ok");
  });

  it("GET / is reachable without a token", async () => {
    const res = await api("/");
    expect(res.status).toBe(200);
  });
});
