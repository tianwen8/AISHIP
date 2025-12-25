/**
 * Credit Service - Unified API for credit operations
 *
 * IMPORTANT: This module provides a clean service layer API
 * that wraps the model layer functions from @/models/credit
 */

import {
  getCreditBalance,
  addCreditTransaction,
  grantCredits as modelGrantCredits,
  TransType,
} from "@/models/credit"
import { getSnowId } from "@/lib/hash"
import { getFirstPaidOrderByUserUuid, getLatestPaidOrderByUserUuid } from "@/models/order"
import { UserCredits } from "@/types/user"
import { Order } from "@/types/order"

// Re-export TransType from model for convenience
export { TransType }

/**
 * Service-level credit transaction types
 * Maps to TransType in model layer
 */
export enum CreditsTransType {
  NewUser = "grant",
  OrderPay = "charge",
  SystemAdd = "grant",
  Ping = "deduct",
  ImageGeneration = "deduct",
  VideoGeneration = "deduct",
}

export enum CreditsAmount {
  NewUserGet = 306, // 新用户赠送306算力（1条Seedance视频，5倍利润）
  DailyCheckIn = 306, // 每日签到+分享赠送306算力（1条Seedance视频）
  PingCost = 1,
}

/**
 * Get user's credit status
 */
export async function getUserCredits(user_uuid: string): Promise<UserCredits> {
  let user_credits: UserCredits = {
    left_credits: 0,
  }

  try {
    const first_paid_order = await getFirstPaidOrderByUserUuid(user_uuid)
    if (first_paid_order) {
      user_credits.is_recharged = true
    }

    const latest_paid_order = await getLatestPaidOrderByUserUuid(user_uuid)
    if (latest_paid_order) {
      const now = new Date()
      const isActive =
        !latest_paid_order.expired_at || latest_paid_order.expired_at > now
      const basicId = process.env.CREEM_PRODUCT_BASIC_ID || ""
      const proId = process.env.CREEM_PRODUCT_PRO_ID || ""

      if (isActive) {
        if (latest_paid_order.product_id === proId) {
          user_credits.plan_tier = "pro"
        } else if (latest_paid_order.product_id === basicId) {
          user_credits.plan_tier = "basic"
        }
      } else {
        user_credits.plan_tier = null
      }
    }

    const balance = await getCreditBalance(user_uuid)
    user_credits.left_credits = balance

    if (user_credits.left_credits < 0) {
      user_credits.left_credits = 0
    }

    if (user_credits.plan_tier) {
      user_credits.is_pro = user_credits.plan_tier === "pro"
    } else if (user_credits.left_credits > 0) {
      user_credits.is_pro = true
    }

    return user_credits
  } catch (e) {
    console.log("get user credits failed: ", e)
    return user_credits
  }
}

/**
 * Decrease credits (deduct for usage)
 */
export async function decreaseCredits({
  user_uuid,
  trans_type,
  credits,
}: {
  user_uuid: string
  trans_type: CreditsTransType
  credits: number
}) {
  try {
    await addCreditTransaction({
      trans_no: getSnowId(),
      user_uuid: user_uuid,
      trans_type: TransType.Deduct,
      credits: -Math.abs(credits), // Ensure negative
      order_no: trans_type, // Store reason in order_no
    })
  } catch (e) {
    console.log("decrease credits failed: ", e)
    throw e
  }
}

/**
 * Increase credits (grant or charge)
 */
export async function increaseCredits({
  user_uuid,
  trans_type,
  credits,
  expired_at,
  order_no,
}: {
  user_uuid: string
  trans_type: string
  credits: number
  expired_at?: string
  order_no?: string
}) {
  try {
    const transType = trans_type === CreditsTransType.OrderPay ? TransType.Charge : TransType.Grant

    await addCreditTransaction({
      trans_no: getSnowId(),
      user_uuid: user_uuid,
      trans_type: transType,
      credits: Math.abs(credits), // Ensure positive
      order_no: order_no || null,
      expired_at: expired_at ? new Date(expired_at) : null,
    })
  } catch (e) {
    console.log("increase credits failed: ", e)
    throw e
  }
}

/**
 * Update credit when order is paid
 */
export async function updateCreditForOrder(order: Order) {
  try {
    // Simple idempotency: if we've already created this transaction, skip
    // (In production, should check by order_no in credits table)

    await increaseCredits({
      user_uuid: order.user_uuid,
      trans_type: CreditsTransType.OrderPay,
      credits: order.credits,
      expired_at: order.expired_at,
      order_no: order.order_no,
    })
  } catch (e) {
    console.log("update credit for order failed: ", e)
    throw e
  }
}
