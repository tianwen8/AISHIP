/**
 * Payment Client Interface
 * Unified interface for all payment providers (Creem, Stripe, etc.)
 */

export interface CheckoutParams {
  amount: number
  currency: string
  product_id: string
  product_name: string
  credits: number
  order_no: string
  user_email: string
  user_uuid: string
  interval?: string | null
  valid_months?: number
  success_url: string
  cancel_url: string
  metadata?: Record<string, any>
}

export interface CheckoutResult {
  order_no: string
  session_id: string
  checkout_url: string
}

export enum PaymentStatus {
  Paid = 'paid',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export interface WebhookEvent {
  type: string
  order_no: string
  session_id: string
  status: PaymentStatus
  paid_email?: string
  paid_detail?: string
  subscription?: {
    id: string
    interval_count: number
    cycle_anchor: number
    period_end: number
    period_start: number
    times: number
  }
}

export interface IPaymentClient {
  /**
   * Create checkout session
   */
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>

  /**
   * Verify webhook signature and parse event
   */
  verifyWebhook(signature: string, body: string, secret: string): Promise<WebhookEvent>

  /**
   * Retrieve checkout session information
   */
  retrieveSession(sessionId: string): Promise<any>
}
