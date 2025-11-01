/**
 * AI Adapter Interface
 * Provider-agnostic interfaces for LLM, T2I, T2V, TTS
 */

// ============ LLM Adapter ============

export interface LLMRequest {
  model: string
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  responseFormat?: 'text' | 'json'
}

export interface LLMResponse {
  output: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  metadata?: Record<string, any>
}

export interface ILLMAdapter {
  call(request: LLMRequest): Promise<LLMResponse>
}

// ============ T2I Adapter ============

export interface T2IRequest {
  model: string
  prompt: string
  negativePrompt?: string
  imageSize?: string // "landscape_16_9", "portrait_9_16", "square", etc.
  width?: number
  height?: number
  numImages?: number
  seed?: number
  stylePreset?: string
}

export interface T2IResponse {
  imageUrl: string
  width: number
  height: number
  seed?: number
  metadata?: Record<string, any>
}

export interface IT2IAdapter {
  call(request: T2IRequest): Promise<T2IResponse>
}

// ============ T2V / I2V Adapter ============

export interface T2VRequest {
  model: string

  // Input sources
  imageUrl?: string // For I2V (image-to-video), optional for direct T2V
  videoUrl?: string // For V2V (video-to-video), Sora 2 Remix
  referenceImageUrls?: string[] // Vidu Reference multi-image input (up to 7 images)

  // Prompts
  prompt: string
  negativePrompt?: string // Wan 2.5, Seedance

  // Video parameters
  duration: number // in seconds (2-12s depending on model)
  width?: number
  height?: number
  fps?: number
  seed?: number
  aspectRatio?: string // "16:9", "9:16", "1:1", "4:3", "21:9", "auto"
  resolution?: '360p' | '480p' | '520p' | '720p' | '1080p' | 'auto' // Unified resolution

  // Veo 3.1 First/Last Frame parameters
  firstFrameUrl?: string // Veo 3.1 first frame control
  lastFrameUrl?: string // Veo 3.1 last frame control
  generateAudio?: boolean // Veo 3.1 audio generation toggle (default: true)

  // Vidu-specific parameters
  movementAmplitude?: 'auto' | 'small' | 'medium' | 'large' // Vidu motion control
  bgm?: boolean // Vidu Q2 I2V background music (4s videos only)
  style?: 'general' | 'anime' // Vidu Q1 T2V style

  // Wan 2.5 parameters
  audioUrl?: string // Wan 2.5 background music support (WAV/MP3, 3-30s, up to 15MB)
  enablePromptExpansion?: boolean // Wan 2.5 LLM-based prompt rewriting (default: true)

  // Seedance parameters
  cameraFixed?: boolean // Seedance camera position fixed (default: false)

  // Safety
  enableSafetyChecker?: boolean // Content filtering (default: true for most models)
}

export interface T2VResponse {
  videoUrl: string
  duration: number
  width: number
  height: number
  fps?: number
  metadata?: Record<string, any>
}

export interface IT2VAdapter {
  call(request: T2VRequest): Promise<T2VResponse>
}

// ============ TTS Adapter ============

export interface TTSRequest {
  model: string
  text: string
  voice: string // Voice ID or name
  speed?: number
  language?: string
}

export interface TTSResponse {
  audioUrl: string
  duration: number // in seconds
  metadata?: Record<string, any>
}

export interface ITTSAdapter {
  call(request: TTSRequest): Promise<TTSResponse>
}
