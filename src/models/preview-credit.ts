import { db } from "@/db";
import { preview_credits } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface PreviewCreditRow {
  id: number;
  user_uuid: string;
  balance: number;
  period_start: Date | null;
  period_end: Date | null;
  updated_at: Date | null;
}

export async function getPreviewCredits(userUuid: string): Promise<PreviewCreditRow | null> {
  const [row] = await db()
    .select()
    .from(preview_credits)
    .where(eq(preview_credits.user_uuid, userUuid))
    .limit(1);

  return row || null;
}

export async function upsertPreviewCredits(data: {
  user_uuid: string;
  balance: number;
  period_start: Date;
  period_end: Date;
}): Promise<PreviewCreditRow> {
  const [row] = await db()
    .insert(preview_credits)
    .values({
      user_uuid: data.user_uuid,
      balance: data.balance,
      period_start: data.period_start,
      period_end: data.period_end,
      updated_at: new Date(),
    })
    .onConflictDoUpdate({
      target: preview_credits.user_uuid,
      set: {
        balance: data.balance,
        period_start: data.period_start,
        period_end: data.period_end,
        updated_at: new Date(),
      },
    })
    .returning();

  return row;
}
