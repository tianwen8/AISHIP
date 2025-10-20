/**
 * Payment Client Factory
 * Dynamically load payment provider based on PAY_PROVIDER env variable
 */

import type { IPaymentClient } from './types'
import { CreemPaymentClient } from './creem'
import { StripePaymentClient } from './stripe'

export * from './types'

/**
 * Get payment client based on environment variable
 * @returns IPaymentClient instance (Creem or Stripe)
 */
export function getPaymentClient(): IPaymentClient {
  const provider = process.env.PAY_PROVIDER || 'creem'

  switch (provider.toLowerCase()) {
    case 'creem':
      return new CreemPaymentClient()

    case 'stripe':
      return new StripePaymentClient()

    default:
      console.warn(`Unknown payment provider: ${provider}, falling back to Creem`)
      return new CreemPaymentClient()
  }
}
