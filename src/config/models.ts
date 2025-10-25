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
    id: "fal-ai/elevenlabs/tts/turbo-v2.5",
    name: "ElevenLabs Turbo V2.5",
    provider: "ElevenLabs (via Fal.ai)",
    quality: "High Quality",
    speed: "Fast (5-10s)",
    credits: 0.5,
    recommended: true,
    description: "Natural-sounding voiceover with fast generation, 32 languages",
  },
  {
    id: "fal-ai/elevenlabs/tts/eleven-v3",
    name: "ElevenLabs V3",
    provider: "ElevenLabs (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Medium (10-15s)",
    credits: 0.7,
    description: "Latest generation with superior voice quality",
  },
  {
    id: "fal-ai/elevenlabs/tts/multilingual-v2",
    name: "ElevenLabs Multilingual V2",
    provider: "ElevenLabs (via Fal.ai)",
    quality: "Good Quality",
    speed: "Fast (3-8s)",
    credits: 0.4,
    description: "Exceptional stability across 29 languages",
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
