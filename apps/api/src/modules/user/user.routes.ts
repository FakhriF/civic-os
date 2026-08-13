import Elysia, { t } from "elysia";
import { authMiddleware } from "../../app/middleware/auth";
import { databasePlugin } from "../../app/plugins/database";
import { UserService } from "./user.service";
import { requireRole } from "../../app/middleware/require-role";
import { isUniqueViolation } from "../../app/utils/unique-violation";

const CreateUserBody = t.Object({
  email: t.String({ format: "email", error: "Must be a valid email address!" }),
  fullName: t.String({ minLength: 2, error: "Full name is required." }),
  password: t.String({
    minLength: 6,
    error: "Password must be at least 6 characters.",
  }),
  roleId: t.Integer(),
  departmentId: t.Integer(),
});

const UpdateUserBody = t.Partial(
  t.Object({
    fullName: t.String({ minLength: 2 }),
    password: t.String({ minLength: 6 }),
    roleId: t.Integer(),
    departmentId: t.Integer(),
    isActive: t.Boolean(),
  }),
);

export const userRoutes = new Elysia({ prefix: "/api/v1/users" })
  .use(databasePlugin)
  .use(authMiddleware)
  .get("/", async ({ db }) => {
    const items = await UserService.findAll(db);
    return { status: "success", data: items };
  })
  .use(requireRole("Administrator"))
  .post(
    "/",
    async ({ db, body, set }) => {
      try {
        const user = await UserService.create(db, body);
        set.status = 201;
        return { status: "success", data: user };
      } catch (err) {
        if (isUniqueViolation(err)) {
          set.status = 409;
          return {
            status: "error",
            error: {
              code: "EMAIL_EXISTS",
              message: "Email is already in use.",
            },
          };
        }
        throw err;
      }
    },
    { body: CreateUserBody },
  )
  .patch(
    "/:id",
    async ({ db, params, body, user, set }) => {
      if (Object.keys(body).length === 0) {
        set.status = 400;
        return {
          status: "error",
          error: { code: "EMPTY_UPDATE", message: "No fields to update." },
        };
      }

      const id = Number(params.id);

      if (body.isActive === false && user?.id === id) {
        set.status = 400;
        return {
          status: "error",
          error: {
            code: "SELF_DEACTIVATION",
            message: "You cannot deactivate your own account.",
          },
        };
      }

      const updated = await UserService.update(db, id, body);
      if (!updated) {
        set.status = 404;
        return {
          status: "error",
          error: { code: "USER_NOT_FOUND", message: "User not found." },
        };
      }

      return { status: "success", data: updated };
    },
    { body: UpdateUserBody },
  );
