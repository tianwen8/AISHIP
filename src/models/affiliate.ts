/**
 * Affiliate Model - CRUD operations for affiliates table
 */

import { db } from "@/db"
import { affiliates } from "@/db/schema.index"
import { eq } from "drizzle-orm"

export interface Affiliate {
  id: number
  user_uuid: string
  created_at: Date | null
  status: string
  invited_by: string
  paid_order_no: string
  paid_amount: number
  reward_percent: number
  reward_amount: number
}

export async function findAffiliateByOrderNo(
  orderNo: string
): Promise<Affiliate | null> {
  const [affiliate] = await db()
    .select()
    .from(affiliates)
    .where(eq(affiliates.paid_order_no, orderNo))
    .limit(1)

  return affiliate || null
}

export async function insertAffiliate(data: {
  user_uuid: string
  invited_by: string
  created_at: Date
  status: string
  paid_order_no: string
  paid_amount: number
  reward_percent: number
  reward_amount: number
}): Promise<Affiliate> {
  const [affiliate] = await db()
    .insert(affiliates)
    .values({
      user_uuid: data.user_uuid,
      invited_by: data.invited_by,
      created_at: data.created_at,
      status: data.status,
      paid_order_no: data.paid_order_no,
      paid_amount: data.paid_amount,
      reward_percent: data.reward_percent,
      reward_amount: data.reward_amount,
    })
    .returning()

  return affiliate
}
