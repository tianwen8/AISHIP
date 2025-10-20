/**
 * Creem Payment Client Implementation
 */

import { newCreemClient } from '@/integrations/creem'
import type {
  IPaymentClient,
  CheckoutParams,
  CheckoutResult,
  WebhookEvent,
} from './types'
import { PaymentStatus } from './types'

export class CreemPaymentClient implements IPaymentClient {
  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const client = newCreemClient()

    //  Get price_id from CREEM_PRODUCTS env
    const productsJson = process.env.CREEM_PRODUCTS || '[]'
    const products = JSON.parse(productsJson)
    const product = products.find((p: any) => p.product_id === params.product_id)

    if (!product) {
      throw new Error(`Product ${params.product_id} not found in CREEM_PRODUCTS`)
    }

    const result = await client.creem().createCheckout({
      xApiKey: client.apiKey(),
      createCheckoutRequest: {
        requestId: params.order_no,
        priceId: product.price_id,
        customer: {
          email: params.user_email,
        },
        metadata: {
          order_no: params.order_no,
          user_uuid: params.user_uuid,
          product_id: params.product_id,
          credits: params.credits.toString(),
          ...(params.metadata || {}),
        },
        successUrl: params.success_url,
        cancelUrl: params.cancel_url,
      },
    })

    return {
      order_no: params.order_no,
      session_id: result.id!,
      checkout_url: result.checkoutUrl!,
    }
  }

  async verifyWebhook(
    signature: string,
    body: string,
    secret: string
  ): Promise<WebhookEvent> {
    // HMAC-SHA256 verification
    const computedSignature = await this.generateSignature(body, secret)

    if (computedSignature !== signature) {
      throw new Error('Invalid webhook signature')
    }

    const event = JSON.parse(body)

    if (event.eventType !== 'checkout.completed') {
      throw new Error(`Unsupported event type: ${event.eventType}`)
    }

    const session = event.object
    if (session.order.status !== 'paid') {
      throw new Error('Invalid order status')
    }

    return {
      type: 'checkout.completed',
      order_no: session.metadata.order_no,
      session_id: session.id,
      status: PaymentStatus.Paid,
      paid_email: session.customer?.email,
      paid_detail: JSON.stringify(session),
    }
  }

  async retrieveSession(sessionId: string): Promise<any> {
    const client = newCreemClient()

    const result = await client.creem().retrieveCheckout({
      xApiKey: client.apiKey(),
      checkoutId: sessionId,
    })

    return result
  }

  private async generateSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(payload)

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', key, messageData)
    const signatureArray = new Uint8Array(signature)
    return Array.from(signatureArray)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
}
