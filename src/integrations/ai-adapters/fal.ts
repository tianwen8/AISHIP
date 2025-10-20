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

      return {
        output: result.data.output || result.data.text || result.data.content,
        usage: result.data.usage,
        metadata: result.data,
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

      const image = result.data.images?.[0] || result.data.image
      if (!image) {
        throw new Error("No image returned from Fal.ai")
      }

      return {
        imageUrl: image.url,
        width: image.width || request.width || 1024,
        height: image.height || request.height || 1024,
        seed: result.data.seed,
        metadata: result.data,
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
      const result = await fal.subscribe(request.model, {
        input: {
          image_url: request.imageUrl,
          prompt: request.prompt,
          duration: request.duration,
          fps: request.fps || 30,
          seed: request.seed,
        },
        logs: true,
        onQueueUpdate: (update) => {
          console.log("T2V Queue:", update.status, "Position:", update.queue_position)
        },
      })

      const video = result.data.video
      if (!video) {
        throw new Error("No video returned from Fal.ai")
      }

      return {
        videoUrl: video.url || video,
        duration: request.duration,
        width: result.data.width || request.width || 1920,
        height: result.data.height || request.height || 1080,
        fps: result.data.fps || request.fps || 30,
        metadata: result.data,
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

      const audio = result.data.audio_url || result.data.audio || result.data.url
      if (!audio) {
        throw new Error("No audio returned from Fal.ai")
      }

      return {
        audioUrl: audio,
        duration: result.data.duration || 0,
        metadata: result.data,
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
