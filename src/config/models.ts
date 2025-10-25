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
    id: "fal-ai/flux-dev",
    name: "FLUX Dev",
    provider: "Fal.ai",
    quality: "High Quality",
    speed: "Medium (15-30s)",
    credits: 0.25,
    recommended: true,
    description: "Balanced quality and speed, best for most use cases",
  },
  {
    id: "fal-ai/flux-schnell",
    name: "FLUX Schnell",
    provider: "Fal.ai",
    quality: "Good Quality",
    speed: "Fast (5-10s)",
    credits: 0.1,
    description: "Faster generation with good results",
  },
  {
    id: "fal-ai/nanobanana-flux",
    name: "Nanobanana FLUX",
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
    id: "fal-ai/kling-v1",
    name: "Kling V1",
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
    id: "fal-ai/veo-3",
    name: "Veo 3",
    provider: "Google (via Fal.ai)",
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
    id: "fal-ai/sora-2",
    name: "Sora 2",
    provider: "OpenAI (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Very Slow (60-90s)",
    credits: 1.5, // per second
    description: "Cinematic quality with automatic audio",
    capabilities: {
      inputType: 'both',  // Supports both T2V and I2V
      audioGeneration: {
        enabled: true,
        types: ['sound-effects', 'voiceover'],  // Sora 2 supports voiceover
        controllable: false,  // Auto-generated, not controllable
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },
];

// ============ Text-to-Speech Models ============

export const TTS_MODELS: ModelOption[] = [
  {
    id: "elevenlabs/turbo-v2",
    name: "ElevenLabs Turbo V2",
    provider: "ElevenLabs",
    quality: "High Quality",
    speed: "Fast (5-10s)",
    credits: 0.5,
    recommended: true,
    description: "Natural-sounding voiceover with fast generation",
  },
  {
    id: "openai/tts-1",
    name: "OpenAI TTS-1",
    provider: "OpenAI",
    quality: "Good Quality",
    speed: "Fast (3-8s)",
    credits: 0.15,
    description: "Cost-effective text-to-speech",
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
