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
    "fal-ai/flux/dev": {
      displayName: "FLUX Dev",
      costTier: "standard",
      cost: 0.025, // $0.025 per image
      provider: "fal",
      bestFor: "General purpose image generation",
    },
    "fal-ai/flux/schnell": {
      displayName: "FLUX Schnell",
      costTier: "budget",
      cost: 0.003,
      provider: "fal",
      bestFor: "Fast preview images",
    },
    "fal-ai/flux-lora": {
      displayName: "FLUX LoRA",
      costTier: "budget",
      cost: 0.002,
      provider: "fal",
      bestFor: "Custom trained models",
    },
  },

  // T2V / I2V Models
  t2v: {
    "fal-ai/minimax-video": {
      displayName: "MiniMax Video",
      costTier: "premium",
      costPerSecond: 0.15,
      provider: "fal",
      bestFor: "Highest quality videos with audio",
    },
    "fal-ai/ltx-video": {
      displayName: "LTX Video",
      costTier: "premium",
      costPerSecond: 0.2,
      provider: "fal",
      bestFor: "Cinematic quality",
    },
    "fal-ai/kling-video/v1/standard/image-to-video": {
      displayName: "Kling V1 Standard",
      costTier: "standard",
      costPerSecond: 0.08,
      provider: "fal",
      bestFor: "Cost-effective video generation",
    },
  },

  // TTS Models
  tts: {
    "fal-ai/elevenlabs/tts/turbo-v2.5": {
      displayName: "ElevenLabs Turbo V2.5",
      costTier: "standard",
      costPer1000Chars: 0.5,
      provider: "fal",
      bestFor: "Natural voice synthesis",
    },
    "fal-ai/elevenlabs/tts/eleven-v3": {
      displayName: "ElevenLabs V3",
      costTier: "premium",
      costPer1000Chars: 0.7,
      provider: "fal",
      bestFor: "Premium voice quality",
    },
  },
}

// Default model selections
export const DEFAULT_MODELS = {
  llm: "deepseek/deepseek-v3",
  t2i: "fal-ai/flux/dev",
  t2v: "fal-ai/kling-video/v1/standard/image-to-video",
  tts: "fal-ai/elevenlabs/tts/turbo-v2.5",
}
