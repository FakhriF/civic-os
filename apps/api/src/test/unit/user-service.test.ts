import { describe, expect, test } from "bun:test";
import { UserService } from "../../modules/user/user.service";
import type { Database } from "../../database/client";

// Minimal Drizzle-shaped stub. It records whatever the service hands to
// .values() / .set(), and returns a fixed row from the follow-up lookup, so
// the password/payload mapping can be tested without a database.
// If the service's query chain changes, this stub breaks loudly — which is
// the point: the test is tied to the real write path.
function recordingDb(recorded: { values?: Record<string, unknown> }) {
  const write = {
    values: (values: Record<string, unknown>) => {
      recorded.values = values;
      return { returning: async () => [{ id: 1 }] };
    },
    set: (values: Record<string, unknown>) => {
      recorded.values = values;
      return { where: () => ({ returning: async () => [{ id: 1 }] }) };
    },
  };

  const row = {
    id: 1,
    email: "stub@civicos.test",
    fullName: "Stub User",
    roleId: 4,
    roleName: "Officer",
    departmentId: 1,
    departmentName: "Population",
    isActive: true,
    createdAt: new Date(),
  };

  const read = {
    from: () => ({
      leftJoin: () => ({
        leftJoin: () => ({
          where: () => ({ limit: async () => [row] }),
        }),
      }),
    }),
  };

  // Only the write/read chains UserService actually uses are implemented, so the
  // shape is asserted instead of structurally satisfied. The cast is confined to
  // this test double and never reaches production code.
  return {
    insert: () => write,
    update: () => write,
    select: () => read,
  } as unknown as Database;
}

function asString(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error(`expected a string, received ${typeof value}`);
  }
  return value;
}

describe("UserService.create — password handling (R2.1)", () => {
  test("stores an argon2id hash, never the plaintext password", async () => {
    const recorded: { values?: Record<string, unknown> } = {};

    await UserService.create(recordingDb(recorded), {
      email: "new@civicos.test",
      fullName: "New User",
      password: "Password123",
      roleId: 4,
      departmentId: 1,
    });

    const values = recorded.values!;
    expect(values).not.toHaveProperty("password");
    expect(values.email).toBe("new@civicos.test");

    const hash = asString(values.passwordHash);
    expect(hash).not.toBe("Password123");
    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(await Bun.password.verify("Password123", hash)).toBe(true);
  });
});

describe("UserService.update — payload mapping (R3)", () => {
  test("maps password to passwordHash and passes other fields through", async () => {
    const recorded: { values?: Record<string, unknown> } = {};

    await UserService.update(recordingDb(recorded), 1, {
      fullName: "Renamed User",
      password: "NewPass123",
    });

    const values = recorded.values!;
    expect(values).not.toHaveProperty("password");
    expect(values.fullName).toBe("Renamed User");
    expect(
      await Bun.password.verify("NewPass123", asString(values.passwordHash)),
    ).toBe(true);
  });

  test("does not touch passwordHash when no password is supplied", async () => {
    const recorded: { values?: Record<string, unknown> } = {};

    await UserService.update(recordingDb(recorded), 1, {
      roleId: 2,
      isActive: false,
    });

    const values = recorded.values!;
    expect(values).not.toHaveProperty("password");
    // A profile-only update must not wipe the stored credential
    expect(values).not.toHaveProperty("passwordHash");
    expect(values.roleId).toBe(2);
    expect(values.isActive).toBe(false);
  });
});
