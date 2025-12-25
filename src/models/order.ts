/**
 * Order Model - CRUD operations for orders table
 * Pure data access layer, no business logic
 */

import { db } from '@/db'
import { orders } from '@/db/schema.index'
import { eq, and, desc } from 'drizzle-orm'

export enum OrderStatus {
  Created = 'created',
  Paid = 'paid',
  Cancelled = 'cancelled',
  Refunded = 'refunded',
}

export interface Order {
  id: number
  order_no: string
  created_at: Date | null
  user_uuid: string
  user_email: string
  amount: number
  interval: string | null
  expired_at: Date | null
  status: string
  stripe_session_id: string | null
  credits: number
  currency: string | null
  sub_id: string | null
  sub_interval_count: number | null
  sub_cycle_anchor: number | null
  sub_period_end: number | null
  sub_period_start: number | null
  sub_times: number | null
  product_id: string | null
  product_name: string | null
  valid_months: number | null
  order_detail: string | null
  paid_at: Date | null
  paid_email: string | null
  paid_detail: string | null
}

/**
 * Find order by order number
 */
export async function findOrderByOrderNo(orderNo: string): Promise<Order | null> {
  const [order] = await db()
    .select()
    .from(orders)
    .where(eq(orders.order_no, orderNo))
    .limit(1)

  return order || null
}

/**
 * Create new order
 */
export async function insertOrder(data: {
  order_no: string
  user_uuid: string
  user_email: string
  amount: number
  credits: number
  currency: string
  product_id: string
  product_name: string
  interval?: string | null
  valid_months?: number
  stripe_session_id?: string | null
  order_detail?: string
}): Promise<Order> {
  const [order] = await db()
    .insert(orders)
    .values({
      order_no: data.order_no,
      user_uuid: data.user_uuid,
      user_email: data.user_email,
      amount: data.amount,
      credits: data.credits,
      currency: data.currency,
      product_id: data.product_id,
      product_name: data.product_name,
      interval: data.interval || null,
      valid_months: data.valid_months || null,
      stripe_session_id: data.stripe_session_id || null,
      order_detail: data.order_detail || null,
      status: OrderStatus.Created,
      created_at: new Date(),
      sub_id: null,
      sub_interval_count: null,
      sub_cycle_anchor: null,
      sub_period_end: null,
      sub_period_start: null,
      sub_times: null,
      expired_at: null,
      paid_at: null,
      paid_email: null,
      paid_detail: null,
    })
    .returning()

  return order
}

/**
 * Update order with checkout session info
 */
export async function updateOrderSession(
  orderNo: string,
  sessionId: string,
  orderDetail: string
): Promise<void> {
  await db()
    .update(orders)
    .set({
      stripe_session_id: sessionId,
      order_detail: orderDetail,
    })
    .where(eq(orders.order_no, orderNo))
}

/**
 * Update order status to paid
 */
export async function updateOrderStatus(
  orderNo: string,
  status: OrderStatus,
  paidAt: string,
  paidEmail: string,
  paidDetail: string
): Promise<void> {
  await db()
    .update(orders)
    .set({
      status,
      paid_at: new Date(paidAt),
      paid_email: paidEmail,
      paid_detail: paidDetail,
    })
    .where(eq(orders.order_no, orderNo))
}

/**
 * Update order with subscription information
 */
export async function updateOrderSubscription(
  orderNo: string,
  subId: string,
  subIntervalCount: number,
  subCycleAnchor: number,
  subPeriodEnd: number,
  subPeriodStart: number,
  status: OrderStatus,
  paidAt: string,
  subTimes: number,
  paidEmail: string,
  paidDetail: string
): Promise<void> {
  await db()
    .update(orders)
    .set({
      sub_id: subId,
      sub_interval_count: subIntervalCount,
      sub_cycle_anchor: subCycleAnchor,
      sub_period_end: subPeriodEnd,
      sub_period_start: subPeriodStart,
      status,
      paid_at: new Date(paidAt),
      sub_times: subTimes,
      paid_email: paidEmail,
      paid_detail: paidDetail,
    })
    .where(eq(orders.order_no, orderNo))
}

/**
 * Find orders by user UUID
 */
export async function findOrdersByUserUuid(userUuid: string): Promise<Order[]> {
  return await db()
    .select()
    .from(orders)
    .where(eq(orders.user_uuid, userUuid))
    .orderBy(orders.created_at)
}

/**
 * Get the first paid order for a user (used to determine if they are a paying customer)
 */
export async function getFirstPaidOrderByUserUuid(userUuid: string): Promise<Order | null> {
  const [order] = await db()
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.user_uuid, userUuid),
        eq(orders.status, OrderStatus.Paid)
      )
    )
    .orderBy(orders.created_at)
    .limit(1);

  return order || null;
}

/**
 * Get latest paid order for a user (used to determine plan tier)
 */
export async function getLatestPaidOrderByUserUuid(userUuid: string): Promise<Order | null> {
  const [order] = await db()
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.user_uuid, userUuid),
        eq(orders.status, OrderStatus.Paid)
      )
    )
    .orderBy(desc(orders.created_at))
    .limit(1)

  return order || null
}
