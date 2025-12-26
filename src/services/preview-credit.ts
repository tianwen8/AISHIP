import { db } from "@/db";
import { preview_credits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPreviewCredits, upsertPreviewCredits } from "@/models/preview-credit";
import type { PlanTier } from "@/tools/definitions";

const DEFAULT_PRO_PREVIEW_CREDITS = Number(process.env.PRO_PREVIEW_CREDITS || 60);

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

export function getProPreviewCreditsPerMonth() {
  return Number.isFinite(DEFAULT_PRO_PREVIEW_CREDITS) && DEFAULT_PRO_PREVIEW_CREDITS > 0
    ? DEFAULT_PRO_PREVIEW_CREDITS
    : 60;
}

export async function ensurePreviewCredits({
  user_uuid,
  plan_tier,
  period_end,
}: {
  user_uuid: string;
  plan_tier?: PlanTier | null;
  period_end?: Date | null;
}) {
  if (plan_tier !== "pro") {
    return { balance: 0, period_end: null as Date | null };
  }

  const now = new Date();
  const targetPeriodEnd = period_end || addMonths(now, 1);
  const existing = await getPreviewCredits(user_uuid);

  if (!existing || !existing.period_end || existing.period_end <= now) {
    const updated = await upsertPreviewCredits({
      user_uuid,
      balance: getProPreviewCreditsPerMonth(),
      period_start: now,
      period_end: targetPeriodEnd,
    });
    return { balance: updated.balance, period_end: updated.period_end };
  }

  if (period_end && existing.period_end && existing.period_end.getTime() !== period_end.getTime()) {
    const updated = await upsertPreviewCredits({
      user_uuid,
      balance: existing.balance,
      period_start: existing.period_start || now,
      period_end: period_end,
    });
    return { balance: updated.balance, period_end: updated.period_end };
  }

  return { balance: existing.balance, period_end: existing.period_end };
}

export async function resetPreviewCredits({
  user_uuid,
  period_end,
  amount,
}: {
  user_uuid: string;
  period_end?: Date | null;
  amount?: number;
}) {
  const now = new Date();
  const resetAmount = typeof amount === "number" ? amount : getProPreviewCreditsPerMonth();
  const targetPeriodEnd = period_end || addMonths(now, 1);
  const updated = await upsertPreviewCredits({
    user_uuid,
    balance: resetAmount,
    period_start: now,
    period_end: targetPeriodEnd,
  });
  return { balance: updated.balance, period_end: updated.period_end };
}

export async function deductPreviewCredits({
  user_uuid,
  cost,
}: {
  user_uuid: string;
  cost: number;
}) {
  const existing = await getPreviewCredits(user_uuid);
  if (!existing) {
    return { success: false, balance: 0 };
  }

  const balance = existing.balance || 0;
  if (balance < cost) {
    return { success: false, balance };
  }

  const newBalance = balance - cost;
  const [row] = await db()
    .update(preview_credits)
    .set({ balance: newBalance, updated_at: new Date() })
    .where(eq(preview_credits.user_uuid, user_uuid))
    .returning();

  return { success: true, balance: row?.balance ?? newBalance };
}
