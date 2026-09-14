import { and, count, eq, ilike, or } from "drizzle-orm";
import { computeTotalPages } from "../../lib/pagination";
import { citizens } from "../../database/schema";
import type { Database } from "../../database/client";

const citizenSelect = {
  id: citizens.id,
  nationalId: citizens.nationalId,
  fullName: citizens.fullName,
  gender: citizens.gender,
  birthDate: citizens.birthDate,
  address: citizens.address,
  occupation: citizens.occupation,
  createdById: citizens.createdById,
  updatedById: citizens.updatedById,
  createdAt: citizens.createdAt,
  updatedAt: citizens.updatedAt,
};

export interface CitizenListParams {
  page: number;
  limit: number;
  search?: string;
  gender?: "male" | "female" | "other";
}

export interface CitizenInput {
  nationalId: string;
  fullName: string;
  gender: "male" | "female" | "other";
  birthDate: string;
  address: string;
  occupation: string;
}

export class PopulationService {
  static async list(db: Database, params: CitizenListParams) {
    const where = and(
      params.search
        ? or(
            ilike(citizens.nationalId, `%${params.search}%`),
            ilike(citizens.fullName, `%${params.search}%`),
          )
        : undefined,
      params.gender ? eq(citizens.gender, params.gender) : undefined,
    );

    const [items, totals] = await Promise.all([
      db
        .select(citizenSelect)
        .from(citizens)
        .where(where)
        .limit(params.limit)
        .offset((params.page - 1) * params.limit),
      db.select({ value: count() }).from(citizens).where(where),
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
    const [citizen] = await db
      .select(citizenSelect)
      .from(citizens)
      .where(eq(citizens.id, id))
      .limit(1);
    return citizen ?? null;
  }

  static async create(db: Database, input: CitizenInput, userId: number) {
    const [inserted] = await db
      .insert(citizens)
      .values({
        ...input,
        createdById: userId,
        updatedById: userId,
      })
      .returning({ id: citizens.id });
    if (!inserted) return null;
    return PopulationService.findById(db, inserted.id);
  }

  static async update(
    db: Database,
    id: number,
    input: Partial<CitizenInput>,
    userId: number,
  ) {
    const [updated] = await db
      .update(citizens)
      .set({ ...input, updatedById: userId })
      .where(eq(citizens.id, id))
      .returning({ id: citizens.id });
    if (!updated) return null;
    return PopulationService.findById(db, updated.id);
  }
}
