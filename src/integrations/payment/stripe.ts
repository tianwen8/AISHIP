/**
 * Stripe Payment Client Implementation (Placeholder)
 * TODO: Implement when needed
 */

import type {
  IPaymentClient,
  CheckoutParams,
  CheckoutResult,
  WebhookEvent,
} from './types'

export class StripePaymentClient implements IPaymentClient {
  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    throw new Error('Stripe payment is not implemented yet. Please use Creem (PAY_PROVIDER=creem)')
  }

  async verifyWebhook(
    signature: string,
    body: string,
    secret: string
  ): Promise<WebhookEvent> {
    throw new Error('Stripe webhook is not implemented yet')
  }

  async retrieveSession(sessionId: string): Promise<any> {
    throw new Error('Stripe session retrieval is not implemented yet')
  }
}
