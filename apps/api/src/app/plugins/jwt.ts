import { Elysia } from "elysia";
import { jwt } from '@elysia/jwt'

// JWT secrets MUST come from the environment (ADR-021).
// Fail fast with a clear message instead of silently falling back to
// hardcoded values, which would leak signing secrets into source control.
const jwtAccessSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (!jwtAccessSecret || !jwtRefreshSecret) {
  throw new Error(
    "Missing JWT secrets: set JWT_SECRET and JWT_REFRESH_SECRET " +
    "(see .env.example, then copy to .env.local)."
  );
}

export const jwtPlugin = new Elysia({ name: "jwt-plugin" })
  .use(
    jwt({
      name: "jwtAccess",
      secret: jwtAccessSecret,
      exp: "15m",
    })
  )
  .use(
    jwt({
      name: "jwtRefresh",
      secret: jwtRefreshSecret,
      exp: "7d"
    })
  )
