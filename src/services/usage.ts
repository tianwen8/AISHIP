import { db } from "@/db";
import { usage_counters } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { PlanTier } from "@/tools/definitions";

export interface UsageLimits {
  perMinute: number;
  perDay: number;
}

const BASIC_LIMITS: UsageLimits = { perMinute: 6, perDay: 60 };
const PRO_LIMITS: UsageLimits = { perMinute: 20, perDay: 300 };

export function getUsageLimits(planTier?: PlanTier | null): UsageLimits {
  return planTier === "pro" ? PRO_LIMITS : BASIC_LIMITS;
}

function getUsageWindowKeys(now = new Date()) {
  const iso = now.toISOString();
  return {
    dayKey: iso.slice(0, 10),
    minuteKey: iso.slice(0, 16),
  };
}

export async function checkAndBumpUsage({
  user_uuid,
  plan_tier,
}: {
  user_uuid: string;
  plan_tier?: PlanTier | null;
}) {
  const limits = getUsageLimits(plan_tier);
  const { dayKey, minuteKey } = getUsageWindowKeys();
  const [row] = await db()
    .select()
    .from(usage_counters)
    .where(eq(usage_counters.user_uuid, user_uuid))
    .limit(1);

  const dayCount = row && row.day_key === dayKey ? row.prompt_count : 0;
  const minuteCount = row && row.minute_key === minuteKey ? row.minute_count : 0;

  if (dayCount + 1 > limits.perDay) {
    return {
      allowed: false,
      reason: "daily_limit",
      limits,
      remainingDay: Math.max(0, limits.perDay - dayCount),
      remainingMinute: Math.max(0, limits.perMinute - minuteCount),
    };
  }

  if (minuteCount + 1 > limits.perMinute) {
    return {
      allowed: false,
      reason: "minute_limit",
      limits,
      remainingDay: Math.max(0, limits.perDay - dayCount),
      remainingMinute: Math.max(0, limits.perMinute - minuteCount),
    };
  }

  const nextDayCount = dayCount + 1;
  const nextMinuteCount = minuteCount + 1;

  await db()
    .insert(usage_counters)
    .values({
      user_uuid,
      day_key: dayKey,
      prompt_count: nextDayCount,
      minute_key: minuteKey,
      minute_count: nextMinuteCount,
      updated_at: new Date(),
    })
    .onConflictDoUpdate({
      target: usage_counters.user_uuid,
      set: {
        day_key: dayKey,
        prompt_count: nextDayCount,
        minute_key: minuteKey,
        minute_count: nextMinuteCount,
        updated_at: new Date(),
      },
    });

  return {
    allowed: true,
    limits,
    remainingDay: Math.max(0, limits.perDay - nextDayCount),
    remainingMinute: Math.max(0, limits.perMinute - nextMinuteCount),
  };
}
