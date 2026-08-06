import {Elysia} from "elysia";
import { jwtPlugin } from "../../app/plugins/jwt";
import { databasePlugin } from "../../app/plugins/database";
import { AuthService } from "./auth.service";
import { LoginBodyDTO } from "./auth.dto";
import { authMiddleware } from "../../app/middleware/auth";

export const authRoutes = new Elysia({ prefix: "/api/v1/auth" })
  .use(jwtPlugin)
  .use(databasePlugin)

  // 1. POST /api/v1/auth/login
  .post(
    "/login",
    async ({ body, db, jwtAccess, jwtRefresh, cookie: { refreshToken }, set }) => {
      const result = await AuthService.validateUser(db, body.email, body.password)

      if (!result || result.error === "ACCOUNT_DISABLED") {
        set.status = 401;
        return {
          status: "error",
          error: {
            code: result?.error || "INVALID_CREDENTIALS",
            message: result?.error === "ACCOUNT_DISABLED"
              ? "Account has been deactivated. Please contact admin."
              : "Invalid email or password.",
          },
        };
      }

      const { user } = result;

      const accessToken = await jwtAccess.sign({
        sub: String(user.id),
        email: user.email,
        roleId: user.roleId,
        departmentId: user.departmentId,
      })

      const refreshTokenValue = await jwtRefresh.sign({
        sub: String(user.id),
      })

      refreshToken.set({
        value: refreshTokenValue,
        httpOnly: true,
        maxAge: 7 * 86400,
        path: "/api/v1/auth/refresh",
        sameSite: "strict",
      })

      return {
        status: "success",
        data: {
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            roleId: user.roleId,
            departmentId: user.departmentId,
          }
        }
      }
    },
    {body: LoginBodyDTO}
  )

  // 2. POST /api/v1/auth/logout
  .post("/logout", ({ cookie: { refreshToken } }) => {
    refreshToken.remove()
    return {
      status: "success",
      message: "Logged out successfully."
    };
  })

  // 3. GET /api/v1/auth/me (Protected route)
  .use(authMiddleware)
  .get("/me", ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return {
        status: "error",
        error: { code: "UNAUTHORIZED", message: "Unauthorized access." }
      };
    }

    return {
      status: "success",
      data: {user}
    }
  })
