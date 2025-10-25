/**
 * Fal.ai Adapter Implementation
 * Unified adapter for LLM, T2I, T2V, TTS using Fal.ai platform
 */

import * as fal from "@fal-ai/serverless-client"
import type {
  ILLMAdapter,
  LLMRequest,
  LLMResponse,
  IT2IAdapter,
  T2IRequest,
  T2IResponse,
  IT2VAdapter,
  T2VRequest,
  T2VResponse,
  ITTSAdapter,
  TTSRequest,
  TTSResponse,
} from "./types"

// Initialize Fal.ai client
if (process.env.FAL_API_KEY) {
  fal.config({
    credentials: process.env.FAL_API_KEY,
  })
}

export class FalLLMAdapter implements ILLMAdapter {
  async call(request: LLMRequest): Promise<LLMResponse> {
    try {
      const result = await fal.subscribe(request.model, {
        input: {
          prompt: request.prompt,
          system_prompt: request.systemPrompt,
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 2000,
          response_format:
            request.responseFormat === "json" ? { type: "json_object" } : undefined,
        },
        logs: true,
      })

      const data = result as any

      return {
        output: data.output || data.text || data.content,
        usage: data.usage,
        metadata: data,
      }
    } catch (error: any) {
      console.error("FalLLMAdapter error:", error)
      throw new Error(`LLM call failed: ${error.message}`)
    }
  }
}

export class FalT2IAdapter implements IT2IAdapter {
  async call(request: T2IRequest): Promise<T2IResponse> {
    try {
      const result = await fal.subscribe(request.model, {
        input: {
          prompt: request.prompt,
          negative_prompt: request.negativePrompt,
          image_size: request.imageSize || "landscape_16_9",
          num_images: request.numImages || 1,
          seed: request.seed,
          style_preset: request.stylePreset,
        },
        logs: true,
        onQueueUpdate: (update) => {
          console.log("T2I Queue:", update.status)
        },
      })

      // Fal.ai returns data directly at top level, not in result.data
      const data = result as any

      // Extract image from response
      const image = data.images?.[0] || data.image
      if (!image) {
        console.error("[FalT2I] Unexpected response format:", data)
        throw new Error("No image returned from Fal.ai")
      }

      return {
        imageUrl: image.url,
        width: image.width || request.width || 1024,
        height: image.height || request.height || 1024,
        seed: data.seed,
        metadata: data,
      }
    } catch (error: any) {
      console.error("FalT2IAdapter error:", error)
      throw new Error(`T2I call failed: ${error.message}`)
    }
  }
}

export class FalT2VAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    try {
      // Build input parameters - handle model-specific differences
      const input: any = {
        prompt: request.prompt,
      }

      // Image-to-Video models require image_url
      if (request.imageUrl) {
        input.image_url = request.imageUrl
      }

      // Duration must be string for Kling models ("5" or "10")
      if (request.model.includes('kling')) {
        input.duration = String(request.duration || 5)
      } else {
        input.duration = request.duration || 5
      }

      // Some models support additional parameters
      if (request.seed) {
        input.seed = request.seed
      }

      const result = await fal.subscribe(request.model, {
        input,
        logs: true,
        onQueueUpdate: (update) => {
          console.log("T2V Queue:", update.status, "Position:", update.queue_position)
        },
      })

      const data = result as any
      const video = data.video
      if (!video) {
        console.error("[FalT2V] Unexpected response:", data)
        throw new Error("No video returned from Fal.ai")
      }

      return {
        videoUrl: video.url || video,
        duration: request.duration || 5,
        width: data.width || request.width || 1920,
        height: data.height || request.height || 1080,
        fps: data.fps || request.fps || 30,
        metadata: data,
      }
    } catch (error: any) {
      console.error("FalT2VAdapter error:", error)
      throw new Error(`T2V call failed: ${error.message}`)
    }
  }
}

export class FalTTSAdapter implements ITTSAdapter {
  async call(request: TTSRequest): Promise<TTSResponse> {
    try {
      const result = await fal.subscribe(request.model, {
        input: {
          text: request.text,
          voice: request.voice,
          speed: request.speed || 1.0,
          language: request.language || "en",
        },
        logs: true,
      })

      const data = result as any
      const audio = data.audio_url || data.audio || data.url
      if (!audio) {
        throw new Error("No audio returned from Fal.ai")
      }

      return {
        audioUrl: audio,
        duration: data.duration || 0,
        metadata: data,
      }
    } catch (error: any) {
      console.error("FalTTSAdapter error:", error)
      throw new Error(`TTS call failed: ${error.message}`)
    }
  }
}

/**
 * Factory function to get adapters
 */
export function getFalAdapters() {
  return {
    llm: new FalLLMAdapter(),
    t2i: new FalT2IAdapter(),
    t2v: new FalT2VAdapter(),
    tts: new FalTTSAdapter(),
  }
}
