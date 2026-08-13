import Elysia, { t } from "elysia";
import { desc, eq } from "drizzle-orm";
import { authMiddleware } from "../../app/middleware/auth";
import { databasePlugin } from "../../app/plugins/database";
import { announcements } from "../../database/schema";
import { requireRole } from "../../app/middleware/require-role";
import {
  AnnouncementService,
  AnnouncementTransitionError,
} from "./announcement.service";

const CreateAnnouncementBody = t.Object({
  title: t.String({ minLength: 3, error: "Title is required." }),
  content: t.String({ minLength: 5, error: "Content is required." }),
  departmentId: t.Integer(),
});

const UpdateAnnouncementBody = t.Partial(
  t.Object({
    title: t.String({ minLength: 3 }),
    content: t.String({ minLength: 5 }),
    departmentId: t.Integer(),
  }),
);

export const announcementRoutes = new Elysia({
  prefix: "/api/v1/announcements",
})
  .use(databasePlugin)
  .use(authMiddleware)
  // Read-only slice for the dashboard — full CRUD lands with M7
  .get("/", async ({ db, query }) => {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(Math.max(1, Number(query.limit ?? 10)), 50);
    const status = query.status as
      "draft" | "published" | "archived" | undefined;
    const departmentId = query.departmentId
      ? Number(query.departmentId)
      : undefined;

    const result = await AnnouncementService.list(db, {
      page,
      limit,
      status,
      departmentId,
    });
    return { status: "success", data: result };
  })
  .get("/:id", async ({ db, params, set }) => {
    const item = await AnnouncementService.findById(db, Number(params.id));
    if (!item) {
      set.status = 404;
      return {
        status: "error",
        error: {
          code: "ANNOUNCEMENT_NOT_FOUND",
          message: "Announcement not found.",
        },
      };
    }
    return { status: "success", data: item };
  })
  .use(requireRole("Officer", "Manager", "Administrator"))
  .post(
    "/",
    async ({ db, body, user, set }) => {
      const item = await AnnouncementService.create(db, body, user!.id);
      set.status = 201;
      return { status: "success", data: item };
    },
    { body: CreateAnnouncementBody },
  )
  .patch(
    "/:id",
    async ({ db, params, body, set }) => {
      if (Object.keys(body).length === 0) {
        set.status = 400;
        return {
          status: "error",
          error: { code: "EMPTY_UPDATE", message: "No fields to update." },
        };
      }

      const item = await AnnouncementService.update(
        db,
        Number(params.id),
        body,
      );
      if (!item) {
        set.status = 404;
        return {
          status: "error",
          error: {
            code: "ANNOUNCEMENT_NOT_FOUND",
            message: "Announcement not found.",
          },
        };
      }
      return { status: "success", data: item };
    },
    { body: UpdateAnnouncementBody },
  )

  .post("/:id/publish", async ({ db, params, set }) => {
    const current = await AnnouncementService.findById(db, Number(params.id));
    if (!current) {
      set.status = 404;
      return {
        status: "error",
        error: {
          code: "ANNOUNCEMENT_NOT_FOUND",
          message: "Announcement not found.",
        },
      };
    }
    try {
      AnnouncementService.assertTransition(current.status, "published");
    } catch (error) {
      if (error instanceof AnnouncementTransitionError) {
        set.status = 400;
        return {
          status: "error",
          error: {
            code: "INVALID_STATUS_TRANSITION",
            message: "Only draft or archived announcements can be published.",
          },
        };
      }
      throw error;
    }
    const item = await AnnouncementService.publish(db, Number(params.id));
    return { status: "success", data: item };
  })

  .post("/:id/archive", async ({ db, params, set }) => {
    const current = await AnnouncementService.findById(db, Number(params.id));
    if (!current) {
      set.status = 404;
      return {
        status: "error",
        error: {
          code: "ANNOUNCEMENT_NOT_FOUND",
          message: "Announcement not found.",
        },
      };
    }
    try {
      AnnouncementService.assertTransition(current.status, "archived");
    } catch (error) {
      if (error instanceof AnnouncementTransitionError) {
        set.status = 400;
        return {
          status: "error",
          error: {
            code: "INVALID_STATUS_TRANSITION",
            message: "Only published announcements can be archived.",
          },
        };
      }
      throw error;
    }
    const item = await AnnouncementService.archive(db, Number(params.id));
    return { status: "success", data: item };
  });
