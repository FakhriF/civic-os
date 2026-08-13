import { describe, expect, test } from "bun:test";
import { computeTotalPages } from "../../lib/pagination";

describe("computeTotalPages", () => {
  test("returns 1 for zero items", () => {
    expect(computeTotalPages(0, 10)).toBe(1);
  });

  test("returns 1 when total is below one page", () => {
    expect(computeTotalPages(3, 10)).toBe(1);
  });

  test("exact multiple does not round up", () => {
    expect(computeTotalPages(20, 10)).toBe(2);
  });

  test("remainder rounds up", () => {
    expect(computeTotalPages(21, 10)).toBe(3);
  });

  test("defensive: non-positive limit returns 1", () => {
    expect(computeTotalPages(5, 0)).toBe(1);
    expect(computeTotalPages(5, -1)).toBe(1);
  });
});
