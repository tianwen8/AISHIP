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
  imageUrl?: string // For I2V (image-to-video), optional for direct T2V
  prompt: string
  duration: number // in seconds
  width?: number
  height?: number
  fps?: number
  seed?: number
  aspectRatio?: string // For models like Sora 2 and Vidu that use aspect ratio instead of width/height

  // Vidu-specific parameters
  movementAmplitude?: 'auto' | 'small' | 'medium' | 'large' // Vidu motion control
  resolution?: '360p' | '520p' | '720p' | '1080p' // Vidu Q2 I2V resolution
  bgm?: boolean // Vidu Q2 I2V background music (4s videos only)
  style?: 'general' | 'anime' // Vidu Q1 T2V style
  referenceImageUrls?: string[] // Vidu Reference multi-image input
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
