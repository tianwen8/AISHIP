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
    credits: 2.5, // $0.025/MP × 100 = 2.5 积分/MP
    recommended: true,
    description: "Balanced quality and speed, best for most use cases",
  },
  {
    id: "fal-ai/flux/schnell",
    name: "FLUX Schnell",
    provider: "Fal.ai",
    quality: "Good Quality",
    speed: "Fast (5-10s)",
    credits: 0.3, // $0.003/MP × 100 = 0.3 积分/MP
    description: "Faster generation with good results",
  },
  {
    id: "fal-ai/flux-lora",
    name: "FLUX LoRA",
    provider: "Fal.ai",
    quality: "Very High Quality",
    speed: "Slow (30-60s)",
    credits: 3.5, // $0.035/MP × 100 = 3.5 积分/MP
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
    credits: 10, // $0.10/秒 × 100 = 10 积分/秒
    recommended: false,
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
    credits: 4.5, // $0.045/秒 × 100 = 4.5 积分/秒
    recommended: true,
    description: "Latest Kling version with improved quality (推荐)",
    capabilities: {
      inputType: 'image',
      outputs: {
        video: { format: 'mp4', hasAudio: false }
      }
    }
  },
  // ============ Sora 2 Models (5 variants) ============
  {
    id: "fal-ai/sora-2/text-to-video",
    name: "Sora 2 T2V",
    provider: "OpenAI (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Medium (30-50s)",
    credits: 10, // $0.10/秒 × 100 = 10 积分/秒
    recommended: false,
    description: "Direct T2V with built-in dialogue and lip sync, 4-12 seconds",
    capabilities: {
      inputType: 'text',
      audioGeneration: {
        enabled: true,
        types: ['voiceover', 'sound-effects'],
        controllable: true,
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },
  {
    id: "fal-ai/sora-2/text-to-video/pro",
    name: "Sora 2 T2V Pro",
    provider: "OpenAI (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Medium (30-50s)",
    credits: 30, // $0.30/秒 × 100 = 30 积分/秒
    description: "Premium T2V with enhanced quality, 4-12 seconds",
    capabilities: {
      inputType: 'text',
      audioGeneration: {
        enabled: true,
        types: ['voiceover', 'sound-effects'],
        controllable: true,
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },
  {
    id: "fal-ai/sora-2/image-to-video",
    name: "Sora 2 I2V",
    provider: "OpenAI (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Medium (30-50s)",
    credits: 10, // $0.10/秒 × 100 = 10 积分/秒
    description: "Image-to-video with first frame control, 4-12 seconds",
    capabilities: {
      inputType: 'image',
      audioGeneration: {
        enabled: true,
        types: ['voiceover', 'sound-effects'],
        controllable: true,
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },
  {
    id: "fal-ai/sora-2/image-to-video/pro",
    name: "Sora 2 I2V Pro",
    provider: "OpenAI (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Medium (30-50s)",
    credits: 30, // $0.30/秒 × 100 = 30 积分/秒
    description: "Premium I2V with enhanced quality, 4-12 seconds",
    capabilities: {
      inputType: 'image',
      audioGeneration: {
        enabled: true,
        types: ['voiceover', 'sound-effects'],
        controllable: true,
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },
  {
    id: "fal-ai/sora-2/video-to-video/remix",
    name: "Sora 2 Remix",
    provider: "OpenAI (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Medium (30-50s)",
    credits: 10, // $0.10/秒 × 100 = 10 积分/秒
    description: "Video-to-video transformation, 4-12 seconds",
    capabilities: {
      inputType: 'both', // Takes video input
      audioGeneration: {
        enabled: true,
        types: ['voiceover', 'sound-effects'],
        controllable: true,
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },
  {
    id: "fal-ai/vidu/q1/text-to-video",
    name: "Vidu Q1 T2V",
    provider: "ShengShu (via Fal.ai)",
    quality: "High Quality",
    speed: "Very Fast (10-20s)",
    credits: 8, // $0.08/秒 × 100 = 8 积分/秒
    description: "Pure T2V, 1080p quality, fixed duration",
    capabilities: {
      inputType: 'text',
      audioGeneration: {
        enabled: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: false }
      }
    }
  },
  {
    id: "fal-ai/vidu/q2/image-to-video/pro",
    name: "Vidu Q2 I2V Pro",
    provider: "ShengShu (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Fast (20-30s)",
    credits: 5, // $0.05/秒 × 100 = 5 积分/秒 (估算)
    recommended: true,
    description: "I2V with duration control (2-8s), 720p/1080p, motion amplitude control",
    capabilities: {
      inputType: 'image',
      audioGeneration: {
        enabled: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: false }
      }
    }
  },
  {
    id: "fal-ai/vidu/reference-to-video",
    name: "Vidu Reference",
    provider: "ShengShu (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Fast (20-30s)",
    credits: 8, // $0.08/秒 × 100 = 8 积分/秒 (同Q1)
    description: "Multi-image reference for consistent character generation (up to 7 images)",
    capabilities: {
      inputType: 'image',  // Requires reference images
      audioGeneration: {
        enabled: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: false }
      }
    }
  },

  // ============ Veo 3.1 Models (7 variants) ============
  {
    id: "fal-ai/veo-3-1",
    name: "Veo 3.1 T2V",
    provider: "Google (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Medium (30-50s)",
    credits: 40, // $0.40/秒 × 100 = 40 积分/秒
    recommended: true,
    description: "Google's premium T2V model, 8s fixed duration, 720p/1080p, with audio",
    capabilities: {
      inputType: 'text',
      audioGeneration: {
        enabled: true,
        types: ['sound-effects', 'music'],
        controllable: true,
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },
  {
    id: "fal-ai/veo-3-1/image-to-video",
    name: "Veo 3.1 I2V",
    provider: "Google (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Medium (30-50s)",
    credits: 40, // $0.40/秒 × 100 = 40 积分/秒
    description: "Veo 3.1 I2V with first frame control, 8s duration",
    capabilities: {
      inputType: 'image',
      audioGeneration: {
        enabled: true,
        types: ['sound-effects', 'music'],
        controllable: true,
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },
  {
    id: "fal-ai/veo-3-1/reference-to-video",
    name: "Veo 3.1 Reference",
    provider: "Google (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Medium (30-50s)",
    credits: 40, // $0.40/秒 × 100 = 40 积分/秒
    description: "Multi-image reference for character consistency",
    capabilities: {
      inputType: 'image',
      audioGeneration: {
        enabled: true,
        types: ['sound-effects', 'music'],
        controllable: true,
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },
  {
    id: "fal-ai/veo-3-1/first-last-frame-to-video",
    name: "Veo 3.1 First/Last Frame",
    provider: "Google (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Medium (30-50s)",
    credits: 40, // $0.40/秒 × 100 = 40 积分/秒
    recommended: true,
    description: "THE SOLUTION for perfect video continuity - control both first AND last frame",
    capabilities: {
      inputType: 'image',
      audioGeneration: {
        enabled: true,
        types: ['sound-effects', 'music'],
        controllable: true,
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },
  {
    id: "fal-ai/veo-3-1/fast",
    name: "Veo 3.1 Fast T2V",
    provider: "Google (via Fal.ai)",
    quality: "High Quality",
    speed: "Fast (15-30s)",
    credits: 15, // $0.15/秒 × 100 = 15 积分/秒
    description: "Fast version, 62.5% cheaper than standard",
    capabilities: {
      inputType: 'text',
      audioGeneration: {
        enabled: true,
        types: ['sound-effects', 'music'],
        controllable: true,
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },
  {
    id: "fal-ai/veo-3-1/fast/image-to-video",
    name: "Veo 3.1 Fast I2V",
    provider: "Google (via Fal.ai)",
    quality: "High Quality",
    speed: "Fast (15-30s)",
    credits: 15, // $0.15/秒 × 100 = 15 积分/秒
    description: "Fast I2V, 62.5% cheaper than standard",
    capabilities: {
      inputType: 'image',
      audioGeneration: {
        enabled: true,
        types: ['sound-effects', 'music'],
        controllable: true,
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },
  {
    id: "fal-ai/veo-3-1/fast/first-last-frame-to-video",
    name: "Veo 3.1 Fast First/Last Frame",
    provider: "Google (via Fal.ai)",
    quality: "High Quality",
    speed: "Fast (15-30s)",
    credits: 15, // $0.15/秒 × 100 = 15 积分/秒
    description: "Fast first/last frame control, 62.5% cheaper",
    capabilities: {
      inputType: 'image',
      audioGeneration: {
        enabled: true,
        types: ['sound-effects', 'music'],
        controllable: true,
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },

  // ============ Wan 2.5 Model ============
  {
    id: "fal-ai/wan-25-preview/image-to-video",
    name: "Wan 2.5",
    provider: "Alibaba (via Fal.ai)",
    quality: "High Quality",
    speed: "Fast (20-30s)",
    credits: 5, // $0.05/秒 × 100 = 5 积分/秒
    description: "Best open-source I2V with audio support, 5-10s duration",
    capabilities: {
      inputType: 'image',
      audioGeneration: {
        enabled: true, // Optional background music
        types: ['music'],
        controllable: false,
        separateTrack: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: true }
      }
    }
  },

  // ============ Seedance Models (2 variants) ============
  {
    id: "fal-ai/seedance/text-to-video",
    name: "Seedance T2V",
    provider: "ByteDance (via Fal.ai)",
    quality: "Good Quality",
    speed: "Very Fast (10-20s)",
    credits: 3.6, // $0.036/秒 × 100 = 3.6 积分/秒 (Lite版720p)
    description: "Ultra-cheap T2V with 2-12s precise duration control",
    capabilities: {
      inputType: 'text',
      audioGeneration: {
        enabled: false
      },
      outputs: {
        video: { format: 'mp4', hasAudio: false }
      }
    }
  },
  {
    id: "fal-ai/seedance/image-to-video",
    name: "Seedance I2V",
    provider: "ByteDance (via Fal.ai)",
    quality: "Good Quality",
    speed: "Very Fast (10-20s)",
    credits: 3.6, // $0.036/秒 × 100 = 3.6 积分/秒 (Lite版720p)
    description: "Ultra-cheap I2V with 2-12s precise duration control",
    capabilities: {
      inputType: 'image',
      audioGeneration: {
        enabled: false
      },
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
    credits: 12, // $0.12/秒 × 100 = 12 积分/秒 (估算)
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
    credits: 0.067, // $0.04/分钟 ÷ 60 = $0.000667/秒 × 100 = 0.067 积分/秒
    recommended: true,
    description: "Open-source TTS with natural voices, supports EN/ZH",
  },
  {
    id: "fal-ai/vibevoice/7b",
    name: "VibeVoice 7B",
    provider: "Microsoft (via Fal.ai)",
    quality: "Premium Quality",
    speed: "Medium (10-15s)",
    credits: 0.1, // 估算：约2.5倍于1.5B模型
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
