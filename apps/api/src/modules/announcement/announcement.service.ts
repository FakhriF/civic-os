import { and, count, desc, eq } from "drizzle-orm";
import { computeTotalPages } from "../../lib/pagination";
import { announcements, departments } from "../../database/schema";
import type { Database } from "../../database/client";

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

export type AnnouncementStatus = "draft" | "published" | "archived";

export class AnnouncementTransitionError extends Error {
  constructor(from: AnnouncementStatus, to: "published" | "archived") {
    super(`Invalid announcement transition: ${from} → ${to}`);
    this.name = "AnnouncementTransitionError";
  }
}

export interface AnnouncementListParams {
  page: number;
  limit: number;
  status?: AnnouncementStatus;
  departmentId?: number;
}

export interface AnnouncementInput {
  title: string;
  content: string;
  departmentId: number;
}

export class AnnouncementService {
  static async list(db: Database, params: AnnouncementListParams) {
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
      totalPages: computeTotalPages(total, params.limit),
    };
  }

  static async findById(db: Database, id: number) {
    const [item] = await db
      .select(announcementSelect)
      .from(announcements)
      .leftJoin(departments, eq(announcements.departmentId, departments.id))
      .where(eq(announcements.id, id))
      .limit(1);
    return item ?? null;
  }

  static async create(db: Database, input: AnnouncementInput, userId: number) {
    const [inserted] = await db
      .insert(announcements)
      .values({
        ...input,
        status: "draft",
        createdById: userId,
      })
      .returning({ id: announcements.id });
    if (!inserted) return null;
    return AnnouncementService.findById(db, inserted.id);
  }

  static async update(
    db: Database,
    id: number,
    input: Partial<AnnouncementInput>,
  ) {
    const [updated] = await db
      .update(announcements)
      .set(input)
      .where(eq(announcements.id, id))
      .returning({ id: announcements.id });
    if (!updated) return null;
    return AnnouncementService.findById(db, updated.id);
  }

  // Pure business rule — unit-tested without a database (specs/testing)
  static assertTransition(
    current: AnnouncementStatus,
    next: "published" | "archived",
  ) {
    const allowed: Record<AnnouncementStatus, ("published" | "archived")[]> = {
      draft: ["published"],
      published: ["archived"],
      archived: ["published"], // republish
    };
    if (!allowed[current].includes(next)) {
      throw new AnnouncementTransitionError(current, next);
    }
  }

  static async publish(db: Database, id: number) {
    // publishedAt is NOT NULL with default now — stamp the actual publish time
    const [updated] = await db
      .update(announcements)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning({ id: announcements.id });
    if (!updated) return null;
    return AnnouncementService.findById(db, updated.id);
  }

  static async archive(db: Database, id: number) {
    const [updated] = await db
      .update(announcements)
      .set({ status: "archived" })
      .where(eq(announcements.id, id))
      .returning({ id: announcements.id });
    if (!updated) return null;
    return AnnouncementService.findById(db, updated.id);
  }
}
