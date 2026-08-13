import Elysia, { t } from "elysia";
import { databasePlugin } from "../../app/plugins/database";
import { authMiddleware } from "../../app/middleware/auth";
import { PopulationService } from "./population.service";
import { requireRole } from "../../app/middleware/require-role";
import { isUniqueViolation } from "../../app/utils/unique-violation";

const CreateCitizenBody = t.Object({
  nationalId: t.String({
    minLength: 16,
    maxLength: 20,
    error: "National ID must be 16-20 characters",
  }),
  fullName: t.String({ minLength: 2, error: "Full name is required." }),
  gender: t.Enum({ male: "male", female: "female", other: "other" }),
  birthDate: t.String({
    format: "date",
    error: "Birth date must be a valid date.",
  }),
  address: t.String({ minLength: 5, error: "Address is required." }),
  occupation: t.String({ minLength: 2, error: "Occupation is required." }),
});

const UpdateCitizenBody = t.Partial(
  t.Object({
    fullName: t.String({ minLength: 2, error: "Full name is required." }),
    gender: t.Enum({ male: "male", female: "female", other: "other" }),
    birthDate: t.String({
      format: "date",
      error: "Birth date must be a valid date.",
    }),
    address: t.String({ minLength: 5, error: "Address is required." }),
    occupation: t.String({ minLength: 2, error: "Occupation is required." }),
  }),
);

export const populationRoutes = new Elysia({ prefix: "/api/v1/citizens" })
  .use(databasePlugin)
  .use(authMiddleware)

  // 1. GET /api/v1/citizens — paginated, searchable list (R1)
  .get("/", async ({ db, query }) => {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(Math.max(1, Number(query.limit ?? 10)), 50);
    const search = typeof query.search === "string" ? query.search : undefined;
    const gender = query.gender as "male" | "female" | "other" | undefined;

    const result = await PopulationService.list(db, {
      page,
      limit,
      search,
      gender,
    });
    return { status: "success", data: result };
  })

  // 2. GET /api/v1/citizens/:id — detail (R2)
  .get("/:id", async ({ db, params, set }) => {
    const citizen = await PopulationService.findById(db, Number(params.id));
    if (!citizen) {
      set.status = 404;
      return {
        status: "error",
        error: { code: "CITIZEN_NOT_FOUND", message: "Citizen not found." },
      };
    }
    return { status: "success", data: citizen };
  })

  // 3 & 4. Create/update — Officer/Manager/Admin only (R3, R4)
  .use(requireRole("Officer", "Manager", "Administrator"))
  .post(
    "/",
    async ({ db, body, user, set }) => {
      try {
        // requireRole guarantees user is non-null here
        const citizen = await PopulationService.create(db, body, user!.id);
        set.status = 201;
        return { status: "success", data: citizen };
      } catch (error) {
        if (isUniqueViolation(error)) {
          set.status = 409;
          return {
            status: "error",
            error: {
              code: "CITIZEN_EXISTS",
              message: "National ID already registered.",
            },
          };
        }
        throw error;
      }
    },
    { body: CreateCitizenBody },
  )

  // 4. PATCH /api/v1/citizens/:id — update (R4)
  .patch(
    "/:id",
    async ({ db, params, body, user, set }) => {
      if (Object.keys(body).length === 0) {
        set.status = 400;
        return {
          status: "error",
          error: { code: "EMPTY_UPDATE", message: "No fields to update" },
        };
      }

      const citizen = await PopulationService.update(
        db,
        Number(params.id),
        body,
        user!.id,
      );
      if (!citizen) {
        set.status = 404;
        return {
          status: "error",
          error: { code: "CITIZEN_NOT_FOUND", message: "Citizen not found." },
        };
      }
      return { status: "success", data: citizen };
    },
    { body: UpdateCitizenBody },
  );
