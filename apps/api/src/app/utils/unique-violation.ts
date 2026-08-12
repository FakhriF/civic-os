// Drizzle wraps driver errors in DrizzleQueryError — the pg code lives on .cause
export function isUniqueViolation(err: unknown) {
  const code =
    (err as { code?: string })?.code ??
    (err as { cause?: { code?: string } })?.cause?.code;
  return code === "23505";
}
