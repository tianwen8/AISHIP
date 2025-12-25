/**
 * Creem Payment Client Implementation
 * Uses Creem REST API with product_id (no price_id required).
 */
import type {
  IPaymentClient,
  CheckoutParams,
  CheckoutResult,
  WebhookEvent,
} from './types'
import { PaymentStatus } from './types'

export class CreemPaymentClient implements IPaymentClient {
  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    const apiKey = process.env.CREEM_API_KEY
    if (!apiKey) {
      throw new Error("CREEM_API_KEY is not set")
    }

    // Optional allowlist via CREEM_PRODUCTS (supports array of strings or objects)
    const productsJson = process.env.CREEM_PRODUCTS || "[]"
    const products = JSON.parse(productsJson)
    const isAllowed = products.length === 0 || products.some((p: any) => {
      if (typeof p === "string") return p === params.product_id
      return p.product_id === params.product_id
    })
    if (!isAllowed) {
      throw new Error(`Product ${params.product_id} not allowed by CREEM_PRODUCTS`)
    }

    const env = (process.env.CREEM_ENV || "").toLowerCase()
    const baseUrl = env === "production" ? "https://api.creem.io" : "https://test-api.creem.io"

    const response = await fetch(`${baseUrl}/v1/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        product_id: params.product_id,
        customer: { email: params.user_email },
        metadata: {
          order_no: params.order_no,
          user_uuid: params.user_uuid,
          product_id: params.product_id,
          credits: params.credits.toString(),
          ...(params.metadata || {}),
        },
        success_url: params.success_url,
      }),
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(
        `Creem createCheckout failed: ${response.status} ${response.statusText} - ${JSON.stringify(result)}`
      )
    }

    return {
      order_no: params.order_no,
      session_id: result.id,
      checkout_url: result.checkout_url || result.checkoutUrl,
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
    const apiKey = process.env.CREEM_API_KEY
    if (!apiKey) {
      throw new Error("CREEM_API_KEY is not set")
    }

    const env = (process.env.CREEM_ENV || "").toLowerCase()
    const baseUrl = env === "production" ? "https://api.creem.io" : "https://test-api.creem.io"

    const response = await fetch(`${baseUrl}/v1/checkouts/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    })

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(
        `Creem retrieveCheckout failed: ${response.status} ${response.statusText} - ${JSON.stringify(result)}`
      )
    }

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
