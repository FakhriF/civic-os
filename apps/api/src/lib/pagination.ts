// Pure pagination math, shared by every list service and unit-tested
// without a database (specs/testing).
export function computeTotalPages(total: number, limit: number): number {
  if (limit <= 0) return 1;
  return Math.max(1, Math.ceil(total / limit));
}
