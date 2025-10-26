/**
 * AI Model Configuration
 * Real Fal.ai models with accurate pricing
 * Used for model selection dropdowns in nodes
 */

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  quality: string;
  speed: string;
  credits: number;
  recommended?: boolean;
  description?: string;

  // Model capabilities (for dynamic workflow generation)
  capabilities?: {
    // Video model capabilities
    audioGeneration?: {
      enabled: boolean;
      types: ('sound-effects' | 'voiceover' | 'music')[];
      controllable: boolean;  // Can control via prompt
      separateTrack: boolean; // Can export audio separately
    };

    // Input type support
    inputType?: 'text' | 'image' | 'both';

    // Output formats
    outputs?: {
      video?: { format: string; hasAudio: boolean };
      audio?: { format: string; separate: boolean };
    };
  };
}

// ============ Text-to-Image Models ============

export const T2I_MODELS: ModelOption[] = [
  {
    id: "fal-ai/flux/dev",
    name: "FLUX Dev",
    provider: "Fal.ai",
    quality: "High Quality",
    speed: "Medium (15-30s)",
    credits: 0.25,
    recommended: true,
    description: "Balanced quality and speed, best for most use cases",
  },
  {
    id: "fal-ai/flux/schnell",
    name: "FLUX Schnell",
    provider: "Fal.ai",
    quality: "Good Quality",
    speed: "Fast (5-10s)",
    credits: 0.1,
    description: "Faster generation with good results",
  },
  {
    id: "fal-ai/flux-lora",
    name: "FLUX LoRA",
    provider: "Fal.ai",
    quality: "Very High Quality",
    speed: "Slow (30-60s)",
    credits: 0.2,
    description: "Premium quality for professional content",
  },
];

// ============ Image-to-Video Models ============

export const I2V_MODELS: ModelOption[] = [
  {
    id: "fal-ai/kling-video/v1/standard/image-to-video",
    name: "Kling V1 Standard",
    provider: "Fal.ai",
    quality: "High Quality",
    speed: "Medium (20-40s)",
    credits: 0.8, // per second
    recommended: true,
    description: "Reliable video generation with smooth motion",
    capabilities: {
      inputType: 'image',
      outputs: {
        video: { format: 'mp4', hasAudio: false }
      }
    }
  },
  {
    id: "fal-ai/kling-video/v1.6/standard/image-to-video",
    name: "Kling V1.6 Standard",
    provider: "Fal.ai",
    quality: "Very High Quality",
    speed: "Medium (30-50s)",
    credits: 1.0, // per second
    description: "Latest Kling version with improved quality",
    capabilities: {
      inputType: 'image',
      outputs: {
        video: { format: 'mp4', hasAudio: false }
      }
    }
  },
  {
    id: "fal-ai/sora-2/text-to-video",
    name: "Sora 2",
    provider: "OpenAI (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Medium (30-50s)",
    credits: 3.0, // $0.30/second * 10 = 3.0 credits/second (assuming 10s average)
    recommended: true,
    description: "Direct T2V with built-in dialogue and lip sync, 4-12 seconds",
    capabilities: {
      inputType: 'text',  // Only supports T2V (not I2V)
      audioGeneration: {
        enabled: true,
        types: ['voiceover', 'sound-effects'],
        controllable: true,  // Controllable via prompt
        separateTrack: false // Audio embedded in video
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },
  {
    id: "fal-ai/minimax-video",
    name: "MiniMax Video",
    provider: "MiniMax (via Fal.ai)",
    quality: "Very High Quality",
    speed: "Slow (40-60s)",
    credits: 1.2, // per second
    description: "Advanced video quality with audio generation",
    capabilities: {
      inputType: 'both',  // Supports both T2V and I2V
      audioGeneration: {
        enabled: true,
        types: ['sound-effects', 'music'],
        controllable: true,
        separateTrack: true
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true },
        audio: { format: 'mp3', separate: true }
      }
    }
  },
  {
    id: "fal-ai/ltx-video",
    name: "LTX Video",
    provider: "Lightricks (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Very Slow (60-90s)",
    credits: 1.5, // per second
    description: "Cinematic quality with fast generation",
    capabilities: {
      inputType: 'both',  // Supports both T2V and I2V
      audioGeneration: {
        enabled: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: false }
      }
    }
  },
];

// ============ Text-to-Speech Models ============

export const TTS_MODELS: ModelOption[] = [
  {
    id: "fal-ai/vibevoice",
    name: "VibeVoice 1.5B",
    provider: "Microsoft (via Fal.ai)",
    quality: "High Quality",
    speed: "Fast (5-10s)",
    credits: 0.3,
    recommended: true,
    description: "Open-source TTS with natural voices, supports EN/ZH",
  },
  {
    id: "fal-ai/vibevoice/7b",
    name: "VibeVoice 7B",
    provider: "Microsoft (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Medium (10-15s)",
    credits: 0.5,
    description: "Higher quality 7B model with background music support",
  },
];

// ============ Helper Functions ============

/**
 * Get model configuration by ID
 */
export function getModelById(modelId: string, type: 't2i' | 'i2v' | 'tts'): ModelOption | undefined {
  const modelList = {
    t2i: T2I_MODELS,
    i2v: I2V_MODELS,
    tts: TTS_MODELS,
  }[type];

  return modelList.find(m => m.id === modelId);
}

/**
 * Get default recommended model for each type
 */
export function getDefaultModel(type: 't2i' | 'i2v' | 'tts'): ModelOption {
  const modelList = {
    t2i: T2I_MODELS,
    i2v: I2V_MODELS,
    tts: TTS_MODELS,
  }[type];

  return modelList.find(m => m.recommended) || modelList[0];
}

/**
 * Calculate I2V cost based on duration
 */
export function calculateI2VCost(modelId: string, durationSeconds: number): number {
  const model = getModelById(modelId, 'i2v');
  if (!model) return 0.8 * durationSeconds; // fallback to default
  return model.credits * durationSeconds;
}
