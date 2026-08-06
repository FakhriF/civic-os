import { Elysia } from "elysia";
import { jwt } from '@elysia/jwt'


export const jwtPlugin = new Elysia({ name: "jwt-plugin" })
  .use(
    jwt({
      name: "jwtAccess",
      secret: process.env.JWT_SECRET || "fbaJqO6em0rGSulKPGM5q3rHV8VysT31",
      exp: "15m",
    })
  )
  .use(
    jwt({
      name: "jwtRefresh",
      secret: process.env.JWT_REFRESH_SECRET || "mqLBFMOhAKgWRjzPRpuIY9f20aPyZme0",
      exp: "7d"
    })
  )
