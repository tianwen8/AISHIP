/**
 * Credit Model - CRUD operations for credits table (ledger)
 * Pure data access layer, no business logic
 *
 * IMPORTANT: Credits are stored as INTEGER micro-units (SCALE=10)
 * - 1 credit = 10 units (0.1 credit precision)
 * - Service layer passes credits (e.g., 2.5), model converts to units (25)
 * - Display layer uses unitsToCredits() to convert back
 */

import { db } from '@/db'
import { credits } from '@/db/schema.index'
import { eq, desc, sql } from 'drizzle-orm'
import { creditsToUnits, unitsToCredits } from '@/services/pricing'

export enum TransType {
  Charge = 'charge',          // Purchase credits
  Deduct = 'deduct',          // Use credits
  Refund = 'refund',          // Refund credits
  Grant = 'grant',            // Free credit grant
  Bonus = 'bonus',            // Referral bonus
  Expire = 'expire',          // Credits expired
}

export interface Credit {
  id: number
  trans_no: string
  created_at: Date | null
  user_uuid: string
  trans_type: string
  credits: number  // Stored as micro-units, converted on read
  order_no: string | null
  expired_at: Date | null
}

/**
 * Get user's credit balance (sum of all transactions)
 * Returns credits (not micro-units) for display
 */
export async function getCreditBalance(userUuid: string): Promise<number> {
  const result = await db()
    .select({
      balance: sql<number>`COALESCE(SUM(${credits.credits}), 0)`,
    })
    .from(credits)
    .where(eq(credits.user_uuid, userUuid))

  const balanceUnits = result[0]?.balance || 0
  return unitsToCredits(balanceUnits)
}

/**
 * Get user's credit transactions history
 * Converts micro-units back to credits for display
 */
export async function getCreditTransactions(
  userUuid: string,
  limit: number = 50
): Promise<Credit[]> {
  const transactions = await db()
    .select()
    .from(credits)
    .where(eq(credits.user_uuid, userUuid))
    .orderBy(desc(credits.created_at))
    .limit(limit)

  // Convert units to credits for display
  return transactions.map((t) => ({
    ...t,
    credits: unitsToCredits(t.credits),
  }))
}

/**
 * Add credit transaction (charge, deduct, refund, grant, etc.)
 * Accepts credits (e.g., 2.5) and converts to micro-units (25) for storage
 */
export async function addCreditTransaction(data: {
  trans_no: string
  user_uuid: string
  trans_type: TransType
  credits: number  // Input in credits (e.g., 2.5, 0.25, -0.8)
  order_no?: string | null
  expired_at?: Date | null
}): Promise<Credit> {
  const [transaction] = await db()
    .insert(credits)
    .values({
      trans_no: data.trans_no,
      user_uuid: data.user_uuid,
      trans_type: data.trans_type,
      credits: creditsToUnits(data.credits),  // Convert to micro-units
      order_no: data.order_no || null,
      expired_at: data.expired_at || null,
      created_at: new Date(),
    })
    .returning()

  // Return with credits converted back for consistency
  return {
    ...transaction,
    credits: unitsToCredits(transaction.credits),
  }
}

/**
 * Deduct credits from user (negative amount)
 */


/**
 * Grant free credits to user (positive amount)
 * Accepts credits (e.g., 50) and addCreditTransaction handles micro-unit conversion
 */
export async function grantCredits(
  userUuid: string,
  amount: number,  // In credits (e.g., 50)
  transNo: string,
  reason: string,
  expiredAt?: Date
): Promise<Credit> {
  return await addCreditTransaction({
    trans_no: transNo,
    user_uuid: userUuid,
    trans_type: TransType.Grant,
    credits: Math.abs(amount), // Ensure positive (still in credits)
    order_no: reason,
    expired_at: expiredAt,
  })
}

/**
 * Find transaction by trans_no
 * Converts micro-units back to credits for display
 */
export async function findTransactionByTransNo(
  transNo: string
): Promise<Credit | null> {
  const [transaction] = await db()
    .select()
    .from(credits)
    .where(eq(credits.trans_no, transNo))
    .limit(1)

  if (!transaction) return null

  return {
    ...transaction,
    credits: unitsToCredits(transaction.credits),
  }
}
