import { Elysia, t } from "elysia";
import { jwtPlugin } from "../../app/plugins/jwt";
import { databasePlugin } from "../../app/plugins/database";
import { AuthService } from "./auth.service";
import { LoginBodyDTO } from "./auth.dto";
import { authMiddleware } from "../../app/middleware/auth";

// Must match login's cookie path exactly — deletion only works if the paths align
const REFRESH_COOKIE_PATH = "/api/v1/auth/refresh";

// Elysia types cookies as an index signature unless the route declares the
// cookie shape; declaring it yields an explicit (non-optional) cookie accessor.
const RefreshCookieDTO = t.Object({ refreshToken: t.Optional(t.String()) });

export const authRoutes = new Elysia({ prefix: "/api/v1/auth" })
  .use(jwtPlugin)
  .use(databasePlugin)

  // 1. POST /api/v1/auth/login
  .post(
    "/login",
    async ({
      body,
      db,
      jwtAccess,
      jwtRefresh,
      cookie: { refreshToken },
      set,
    }) => {
      const result = await AuthService.validateUser(
        db,
        body.email,
        body.password,
      );

      if (!result || !result.user) {
        set.status = 401;
        return {
          status: "error",
          error: {
            code: result?.error || "INVALID_CREDENTIALS",
            message:
              result?.error === "ACCOUNT_DISABLED"
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
      });

      const refreshTokenValue = await jwtRefresh.sign({
        sub: String(user.id),
      });

      refreshToken.set({
        value: refreshTokenValue,
        httpOnly: true,
        maxAge: 7 * 86400,
        path: "/api/v1/auth/refresh",
        sameSite: "strict",
      });

      return {
        status: "success",
        data: {
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            roleId: user.roleId,
            roleName: user.roleName,
            departmentId: user.departmentId,
          },
        },
      };
    },
    { body: LoginBodyDTO, cookie: RefreshCookieDTO },
  )

  // 2. POST /api/v1/auth/logout
  .post(
    "/logout",
    ({ cookie: { refreshToken } }) => {
      refreshToken.set({
        value: "",
        maxAge: 0,
        expires: new Date(0),
        path: REFRESH_COOKIE_PATH,
        sameSite: "strict",
        httpOnly: true,
      });
      return {
        status: "success",
        message: "Logged out successfully.",
      };
    },
    { cookie: RefreshCookieDTO },
  )

  // 3. POST /api/v1/auth/refresh
  .post(
    "/refresh",
    async ({ db, jwtAccess, jwtRefresh, cookie: { refreshToken }, set }) => {
      const token = refreshToken.value as string | undefined;

      if (!token) {
        set.status = 401;
        return {
          status: "error",
          error: { code: "UNAUTHORIZED", message: "Unauthorized access." },
        };
      }

      const payload = await jwtRefresh.verify(token);
      if (!payload || typeof payload !== "object" || !payload.sub) {
        refreshToken.set({
          value: "",
          maxAge: 0,
          expires: new Date(0),
          path: REFRESH_COOKIE_PATH,
          sameSite: "strict",
          httpOnly: true,
        });
        set.status = 401;
        return {
          status: "error",
          error: { code: "UNAUTHORIZED", message: "Unauthorized access." },
        };
      }

      const user = await AuthService.findActiveUserById(
        db,
        Number(payload.sub),
      );

      if (!user) {
        refreshToken.set({
          value: "",
          maxAge: 0,
          expires: new Date(0),
          path: REFRESH_COOKIE_PATH,
          sameSite: "strict",
          httpOnly: true,
        });
        set.status = 401;
        return {
          status: "error",
          error: { code: "UNAUTHORIZED", message: "Unauthorized access." },
        };
      }

      const accessToken = await jwtAccess.sign({
        sub: String(user.id),
        email: user.email,
        roleId: user.roleId,
        departmentId: user.departmentId,
      });

      return {
        status: "success",
        data: {
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            roleId: user.roleId,
            roleName: user.roleName,
            departmentId: user.departmentId,
          },
        },
      };
    },
    { cookie: RefreshCookieDTO },
  )

  // 4. GET /api/v1/auth/me (Protected route)
  .use(authMiddleware)
  .get("/me", ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return {
        status: "error",
        error: { code: "UNAUTHORIZED", message: "Unauthorized access." },
      };
    }

    return {
      status: "success",
      data: { user },
    };
  });
