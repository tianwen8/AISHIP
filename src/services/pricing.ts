/**
 * Pricing Module - Power Units System
 *
 * DESIGN PHILOSOPHY:
 * - Simple fixed pricing per video (not per-second micro-calculation)
 * - 1 Power Unit ≈ $0.001 USD
 * - High quality 15s video = 400 PU
 * - Economy 15s video = 306 PU
 * - New users get 306 PU (1 free economy video)
 */

// ============ Core Constants ============

/**
 * Power Unit to USD conversion
 * 1 Power Unit = $0.001 USD
 * 1000 Power Units = $1 USD
 */
export const USD_PER_POWER_UNIT = 0.001

/**
 * Power Unit scale for micro-units (database storage)
 * SCALE = 10 means 0.1 PU precision
 */
export const POWER_UNIT_SCALE = 10

// ============ Fixed Video Pricing ============

/**
 * Standard 15-second video pricing
 */
export const VIDEO_PRICING_15S = {
  // High quality: Kling v1.6 T2V ($0.771 cost × 5x profit ≈ $3.86)
  highQuality: 400,  // Power Units

  // Economy: Seedance T2V ($0.55 cost × 5x profit ≈ $2.75)
  economy: 306,      // Power Units (also the new user bonus amount!)

  // Premium: Sora 2 T2V ($1.50 cost × 5x profit ≈ $7.50)
  premium: 750,      // Power Units
} as const

/**
 * Pricing by duration (scales linearly from 15s base)
 */
export function getVideoPricing(durationSeconds: number, quality: 'economy' | 'highQuality' | 'premium' = 'highQuality'): number {
  const basePricing = VIDEO_PRICING_15S[quality]
  const scaleFactor = durationSeconds / 15
  return Math.round(basePricing * scaleFactor)
}

// ============ Model-Specific Pricing ============

/**
 * T2V Model pricing (per 15 seconds)
 * Maps model IDs to Power Units for 15s video
 */
export const T2V_MODEL_PRICING: Record<string, number> = {
  // Kling models
  "fal-ai/kling-video/v1": 600,           // $0.10/s × 15s = $1.50 × 5 = $7.50
  "fal-ai/kling-video/v1.6/standard/text-to-video": 400,  // Recommended
  "fal-ai/kling-video/v1.6/standard/image-to-video": 400,
  "fal-ai/kling-video/v1.6/pro/text-to-video": 1000,

  // Sora models
  "fal-ai/sora-2/text-to-video": 750,
  "fal-ai/sora-2/text-to-video/pro": 2250,
  "fal-ai/sora-2/image-to-video": 750,

  // Seedance models (economy)
  "fal-ai/seedance/text-to-video": 306,   // Economy option!
  "fal-ai/seedance/image-to-video": 306,

  // Veo models
  "fal-ai/veo-3-1": 3000,                 // $0.40/s × 15s = $6 × 5 = $30
  "fal-ai/veo-3-1/fast": 1125,

  // Other models
  "fal-ai/wan-25-preview/text-to-video": 375,
  "fal-ai/wan-25-preview/image-to-video": 375,
  "fal-ai/minimax-video": 900,
  "fal-ai/ltx-video": 113,
  "fal-ai/vidu/text-to-video": 600,
}

/**
 * Calculate T2V cost based on model and duration
 */
export function calculateT2VCost(model: string, durationSeconds: number): number {
  const base15sCost = T2V_MODEL_PRICING[model] || VIDEO_PRICING_15S.highQuality
  const scaleFactor = durationSeconds / 15
  return Math.round(base15sCost * scaleFactor)
}

/**
 * T2I Model pricing (per image)
 */
export const T2I_MODEL_PRICING: Record<string, number> = {
  "fal-ai/flux/dev": 3,           // $0.025 × 100 = 2.5 ≈ 3 PU
  "fal-ai/flux/schnell": 1,       // $0.003 × 100 = 0.3 ≈ 1 PU
  "fal-ai/flux-lora": 4,          // $0.035 × 100 = 3.5 ≈ 4 PU
  "fal-ai/flux-pro": 8,
}

/**
 * Calculate T2I cost
 */
export function calculateT2ICost(model: string = "fal-ai/flux/dev"): number {
  return T2I_MODEL_PRICING[model] || 3
}

/**
 * TTS Model pricing (per generation, ~15s of audio)
 */
export const TTS_MODEL_PRICING: Record<string, number> = {
  "fal-ai/vibevoice": 1,          // $0.04/min = $0.01/15s × 100 = 1 PU
  "fal-ai/vibevoice/7b": 2,
}

/**
 * Calculate TTS cost
 */
export function calculateTTSCost(model: string = "fal-ai/vibevoice"): number {
  return TTS_MODEL_PRICING[model] || 1
}

/**
 * Video merging cost (fixed)
 */
export const MERGE_COST = 1  // Power Unit (negligible, $0.001)

/**
 * Calculate merge cost
 */
export function calculateMergeCost(): number {
  return MERGE_COST
}

// ============ Workflow Estimation ============

/**
 * Estimate total Power Units for a complete workflow
 * Used by AI Planner for user-facing estimates
 */
export function estimateWorkflowCost(params: {
  sceneCount: number
  totalDurationSeconds: number
  hasVoiceover: boolean
  workflowType: 't2v' | 't2i-i2v'  // NEW: workflow type
  t2iModel?: string
  t2vModel?: string
  ttsModel?: string
}): number {
  let totalPowerUnits = 0

  if (params.workflowType === 't2v') {
    // Direct T2V workflow (recommended for pure text input)
    totalPowerUnits += calculateT2VCost(
      params.t2vModel || "fal-ai/kling-video/v1.6/standard/text-to-video",
      params.totalDurationSeconds
    )
  } else {
    // T2I + I2V workflow (only when user provides reference image)
    // T2I cost (one image per scene)
    totalPowerUnits += params.sceneCount * calculateT2ICost(params.t2iModel)

    // I2V cost
    totalPowerUnits += calculateT2VCost(
      params.t2vModel || "fal-ai/kling-video/v1.6/standard/image-to-video",
      params.totalDurationSeconds
    )
  }

  // TTS cost (if voiceover requested)
  if (params.hasVoiceover) {
    totalPowerUnits += calculateTTSCost(params.ttsModel)
  }

  // Merge cost
  totalPowerUnits += calculateMergeCost()

  return Math.round(totalPowerUnits)
}

// ============ Unit Conversion Helpers ============

/**
 * Convert USD to Power Units
 */
export function usdToPowerUnits(usd: number): number {
  return Math.round(usd / USD_PER_POWER_UNIT)
}

/**
 * Convert Power Units to micro-units for database storage
 */
export function powerUnitsToMicroUnits(powerUnits: number): number {
  return Math.round(powerUnits * POWER_UNIT_SCALE)
}

/**
 * Convert micro-units back to Power Units for display
 */
export function microUnitsToPowerUnits(microUnits: number): number {
  return microUnits / POWER_UNIT_SCALE
}

// Legacy aliases for backward compatibility
export const creditsToUnits = powerUnitsToMicroUnits
export const unitsToCredits = microUnitsToPowerUnits

// ============ Quick Reference ============

/**
 * Standard pricing summary (for reference)
 */
export const STANDARD_PRICING = {
  video15sEconomy: VIDEO_PRICING_15S.economy,        // 306 PU
  video15sHighQuality: VIDEO_PRICING_15S.highQuality, // 400 PU
  video15sPremium: VIDEO_PRICING_15S.premium,        // 750 PU
  imageGeneration: 3,                                // 3 PU
  voiceover: 1,                                      // 1 PU
  merge: 1,                                          // 1 PU
} as const

/**
 * New user bonus
 */
export const NEW_USER_BONUS = VIDEO_PRICING_15S.economy  // 306 Power Units
