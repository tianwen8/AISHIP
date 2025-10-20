/**
 * Pricing Module - Single source of truth for all credit costs
 *
 * CRITICAL: This module MUST be imported by both:
 * - AI Planner (for estimation)
 * - Orchestrator (for actual deduction)
 *
 * To ensure estimate = deduction parity and prevent overcharging users
 */

// ============ Core Constants ============

/**
 * Base conversion rate: 1 credit = $0.10 USD
 */
export const USD_PER_CREDIT = 0.10

/**
 * Credit scale for micro-units (prevents fractional rounding issues)
 * SCALE = 10 means 0.1 credit precision (e.g., 2.5 credits = 25 units)
 */
export const CREDIT_SCALE = 10

// ============ Model Pricing (in USD) ============

/**
 * Text-to-Image pricing per image
 * Based on Fal.ai FLUX pricing: ~$0.025/image
 */
export const T2I_COST_USD = {
  "fal-ai/flux-dev": 0.025,
  "fal-ai/flux-schnell": 0.01,
  "fal-ai/nanobanana-flux": 0.02,
  default: 0.025,
} as const

/**
 * Image-to-Video pricing per second
 * Based on Fal.ai Kling-v1 pricing: ~$0.08/second
 */
export const T2V_COST_USD_PER_SECOND = {
  "fal-ai/kling-v1": 0.08,
  "fal-ai/veo-3": 0.12,
  "fal-ai/sora-2": 0.15,
  default: 0.08,
} as const

/**
 * Text-to-Speech pricing per generation
 * Based on ElevenLabs Turbo pricing: ~$0.05/generation (typical script ~50-100 chars)
 */
export const TTS_COST_USD = {
  "elevenlabs/turbo-v2": 0.05,
  "openai/tts-1": 0.015,
  default: 0.05,
} as const

/**
 * Video merging cost (Shotstack API)
 */
export const MERGE_COST_USD = 0.05

// ============ Helper Functions ============

/**
 * Convert USD to credits
 */
export function usdToCredits(usd: number): number {
  return usd / USD_PER_CREDIT
}

/**
 * Convert credits to micro-units for database storage
 */
export function creditsToUnits(credits: number): number {
  return Math.round(credits * CREDIT_SCALE)
}

/**
 * Convert micro-units back to credits for display
 */
export function unitsToCredits(units: number): number {
  return units / CREDIT_SCALE
}

// ============ Model-Specific Cost Calculators ============

/**
 * Calculate T2I cost in credits
 */
export function calculateT2ICost(model: string = "default"): number {
  const usdCost = T2I_COST_USD[model as keyof typeof T2I_COST_USD] || T2I_COST_USD.default
  return usdToCredits(usdCost)
}

/**
 * Calculate T2V cost in credits
 */
export function calculateT2VCost(model: string = "default", durationSeconds: number): number {
  const usdPerSecond = T2V_COST_USD_PER_SECOND[model as keyof typeof T2V_COST_USD_PER_SECOND] || T2V_COST_USD_PER_SECOND.default
  return usdToCredits(usdPerSecond * durationSeconds)
}

/**
 * Calculate TTS cost in credits
 */
export function calculateTTSCost(model: string = "default"): number {
  const usdCost = TTS_COST_USD[model as keyof typeof TTS_COST_USD] || TTS_COST_USD.default
  return usdToCredits(usdCost)
}

/**
 * Calculate merge cost in credits
 */
export function calculateMergeCost(): number {
  return usdToCredits(MERGE_COST_USD)
}

// ============ Workflow Estimation ============

/**
 * Estimate total credits for a workflow
 * Used by AI Planner for user-facing estimates
 */
export function estimateWorkflowCost(params: {
  sceneCount: number
  totalDurationSeconds: number
  hasVoiceover: boolean
  t2iModel?: string
  t2vModel?: string
  ttsModel?: string
}): number {
  let totalCredits = 0

  // T2I cost (one image per scene)
  totalCredits += params.sceneCount * calculateT2ICost(params.t2iModel)

  // T2V cost (total video duration)
  totalCredits += calculateT2VCost(params.t2vModel, params.totalDurationSeconds)

  // TTS cost (if voiceover requested)
  if (params.hasVoiceover) {
    totalCredits += calculateTTSCost(params.ttsModel)
  }

  // Merge cost
  totalCredits += calculateMergeCost()

  return totalCredits
}

// ============ Exports for Quick Reference ============

/**
 * Standard pricing in credits (for quick reference)
 */
export const STANDARD_PRICING = {
  t2i: calculateT2ICost(),           // 0.25 credits/image
  t2vPerSecond: usdToCredits(0.08),  // 0.8 credits/second
  tts: calculateTTSCost(),            // 0.5 credits/generation
  merge: calculateMergeCost(),        // 0.5 credits
} as const
