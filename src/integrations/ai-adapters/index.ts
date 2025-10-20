/**
 * AI Adapters Entry Point
 * Export all adapters and model configurations
 */

export * from "./types"
export * from "./fal"

// Model Registry - Configuration for all available models
export const AI_MODELS = {
  // LLM Models
  llm: {
    "deepseek/deepseek-v3": {
      displayName: "DeepSeek V3",
      costTier: "budget",
      provider: "fal",
      bestFor: "Cost-effective script generation",
    },
    "openai/gpt-4-turbo": {
      displayName: "GPT-4 Turbo",
      costTier: "premium",
      provider: "fal",
      bestFor: "Complex storyline planning",
    },
  },

  // T2I Models
  t2i: {
    "fal-ai/flux-dev": {
      displayName: "FLUX Dev",
      costTier: "standard",
      cost: 0.025, // $0.025 per image
      provider: "fal",
      bestFor: "General purpose image generation",
    },
    "fal-ai/flux-schnell": {
      displayName: "FLUX Schnell",
      costTier: "budget",
      cost: 0.003,
      provider: "fal",
      bestFor: "Fast preview images",
    },
    "fal-ai/nanobanana": {
      displayName: "NanoBanana",
      costTier: "budget",
      cost: 0.002,
      provider: "fal",
      bestFor: "Cartoon and stylized images",
    },
  },

  // T2V / I2V Models
  t2v: {
    "fal-ai/veo-3": {
      displayName: "Veo 3",
      costTier: "premium",
      costPerSecond: 0.15,
      provider: "fal",
      bestFor: "Highest quality videos",
    },
    "fal-ai/sora-2": {
      displayName: "Sora 2",
      costTier: "premium",
      costPerSecond: 0.2,
      provider: "fal",
      bestFor: "Physically realistic motion",
    },
    "fal-ai/kling-v1": {
      displayName: "Kling v1",
      costTier: "standard",
      costPerSecond: 0.08,
      provider: "fal",
      bestFor: "Cost-effective video generation",
    },
  },

  // TTS Models
  tts: {
    "elevenlabs/turbo-v2": {
      displayName: "ElevenLabs Turbo",
      costTier: "standard",
      costPer1000Chars: 0.5,
      provider: "fal",
      bestFor: "Natural voice synthesis",
    },
    "openai/tts-1": {
      displayName: "OpenAI TTS",
      costTier: "budget",
      costPer1000Chars: 0.015,
      provider: "fal",
      bestFor: "Fast voice generation",
    },
  },
}

// Default model selections
export const DEFAULT_MODELS = {
  llm: "deepseek/deepseek-v3",
  t2i: "fal-ai/flux-dev",
  t2v: "fal-ai/kling-v1",
  tts: "elevenlabs/turbo-v2",
}
