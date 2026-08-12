import { and, count, desc, eq } from "drizzle-orm";
import { announcements, departments } from "../../database/schema";

const announcementSelect = {
  id: announcements.id,
  title: announcements.title,
  content: announcements.content,
  status: announcements.status,
  publishedAt: announcements.publishedAt,
  departmentId: announcements.departmentId,
  departmentName: departments.name,
  createdById: announcements.createdById,
  createdAt: announcements.createdAt,
  updatedAt: announcements.updatedAt,
};

export interface AnnouncementListParams {
  page: number;
  limit: number;
  status?: "draft" | "published" | "archived";
  departmentId?: number;
}

export interface AnnouncementInput {
  title: string;
  content: string;
  departmentId: number;
}

export class AnnouncementService {
  static async list(db: any, params: AnnouncementListParams) {
    const where = and(
      params.status ? eq(announcements.status, params.status) : undefined,
      params.departmentId
        ? eq(announcements.departmentId, params.departmentId)
        : undefined,
    );

    const [items, totals] = await Promise.all([
      db
        .select(announcementSelect)
        .from(announcements)
        .leftJoin(departments, eq(announcements.departmentId, departments.id))
        .where(where)
        .orderBy(desc(announcements.createdAt))
        .limit(params.limit)
        .offset((params.page - 1) * params.limit),
      db.select({ value: count() }).from(announcements).where(where),
    ]);

    const total = totals[0]?.value ?? 0;
    return {
      items,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    };
  }

  static async findById(db: any, id: number) {
    const [item] = await db
      .select(announcementSelect)
      .from(announcements)
      .leftJoin(departments, eq(announcements.departmentId, departments.id))
      .where(eq(announcements.id, id))
      .limit(1);
    return item ?? null;
  }

  static async create(db: any, input: AnnouncementInput, userId: number) {
    const [inserted] = await db
      .insert(announcements)
      .values({
        ...input,
        status: "draft",
        createdById: userId,
      })
      .returning({ id: announcements.id });
    return AnnouncementService.findById(db, inserted.id);
  }

  static async update(db: any, id: number, input: Partial<AnnouncementInput>) {
    const [updated] = await db
      .update(announcements)
      .set(input)
      .where(eq(announcements.id, id))
      .returning({ id: announcements.id });
    if (!updated) return null;
    return AnnouncementService.findById(db, updated.id);
  }

  static async publish(db: any, id: number) {
    // publishedAt is NOT NULL with default now — stamp the actual publish time
    const [updated] = await db
      .update(announcements)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning({ id: announcements.id });
    if (!updated) return null;
    return AnnouncementService.findById(db, updated.id);
  }

  static async archive(db: any, id: number) {
    const [updated] = await db
      .update(announcements)
      .set({ status: "archived" })
      .where(eq(announcements.id, id))
      .returning({ id: announcements.id });
    if (!updated) return null;
    return AnnouncementService.findById(db, updated.id);
  }
}
