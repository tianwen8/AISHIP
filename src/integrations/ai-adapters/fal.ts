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
      // Detect if this is a Sora 2 model and delegate to Sora 2 adapter
      if (request.model.includes('sora-2')) {
        const sora2Adapter = new FalSora2Adapter()
        return await sora2Adapter.call(request)
      }

      // Build minimal input parameters per Fal.ai official docs
      // Kling models only support: prompt, image_url
      const input: any = {
        prompt: request.prompt,
      }

      // Image-to-Video models require image_url
      if (request.imageUrl) {
        input.image_url = request.imageUrl
      }

      // Note: Kling models do NOT support duration, fps, or seed parameters
      // Only include these for other video models if needed in the future

      console.log("[FalT2V] Calling with input:", JSON.stringify(input, null, 2))

      const result = await fal.subscribe(request.model, {
        input,
        logs: true,
        onQueueUpdate: (update) => {
          console.log("T2V Queue:", update.status, "Position:", update.queue_position)
        },
      })

      const data = result as any
      console.log("[FalT2V] Response data:", JSON.stringify(data, null, 2))

      const video = data.video
      if (!video) {
        console.error("[FalT2V] Unexpected response format:", data)
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
      if (error.body) {
        console.error("Error body:", JSON.stringify(error.body, null, 2))
      }
      throw new Error(`T2V call failed: ${error.message}`)
    }
  }
}

export class FalTTSAdapter implements ITTSAdapter {
  async call(request: TTSRequest): Promise<TTSResponse> {
    try {
      // Map voice parameter to VibeVoice preset
      const voicePresetMap: Record<string, string> = {
        'female': 'Alice [EN]',
        'male': 'Carter [EN]',
        'default': 'Alice [EN]'
      }

      const preset = voicePresetMap[request.voice] || voicePresetMap['default']

      // VibeVoice API format
      const input: any = {
        script: request.text,
        speakers: [
          {
            preset: preset
          }
        ]
      }

      console.log("[FalTTS] Calling VibeVoice with:", JSON.stringify(input, null, 2))

      const result = await fal.subscribe(request.model, {
        input,
        logs: true,
      })

      const data = result as any
      console.log("[FalTTS] Response data:", JSON.stringify(data, null, 2))

      const audio = data.audio_url || data.audio || data.url
      if (!audio) {
        console.error("[FalTTS] Unexpected response format:", data)
        throw new Error("No audio returned from Fal.ai")
      }

      return {
        audioUrl: audio,
        duration: data.duration || 0,
        metadata: data,
      }
    } catch (error: any) {
      console.error("FalTTSAdapter error:", error)
      if (error.body) {
        console.error("Error body:", JSON.stringify(error.body, null, 2))
      }
      throw new Error(`TTS call failed: ${error.message}`)
    }
  }
}

/**
 * Sora 2 Adapter - Direct Text-to-Video with Audio
 * Supports: 4/8/12s duration, 16:9/9:16 aspect ratio, built-in audio
 */
export class FalSora2Adapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    try {
      // Sora 2 API parameters
      // Reference: https://fal.ai/models/fal-ai/sora-2/text-to-video/api
      const input: any = {
        prompt: request.prompt,
      }

      // Duration: only 4, 8, or 12 seconds supported
      if (request.duration) {
        // Map to nearest supported duration
        if (request.duration <= 4) {
          input.duration = 4
        } else if (request.duration <= 8) {
          input.duration = 8
        } else {
          input.duration = 12
        }
      } else {
        input.duration = 4 // Default
      }

      // Aspect ratio: 16:9 or 9:16
      // Determine from width/height or default to 16:9
      if (request.width && request.height) {
        const ratio = request.width / request.height
        input.aspect_ratio = ratio > 1 ? '16:9' : '9:16'
      } else {
        input.aspect_ratio = '16:9' // Default
      }

      // Resolution: 720p (standard) or 1080p (pro)
      // Default to 720p for MVP
      input.resolution = '720p'

      console.log("[FalSora2] Calling with input:", JSON.stringify(input, null, 2))

      const result = await fal.subscribe(request.model, {
        input,
        logs: true,
        onQueueUpdate: (update) => {
          console.log("Sora 2 Queue:", update.status, "Position:", update.queue_position)
        },
      })

      const data = result as any
      console.log("[FalSora2] Response data:", JSON.stringify(data, null, 2))

      const video = data.video
      if (!video) {
        console.error("[FalSora2] Unexpected response format:", data)
        throw new Error("No video returned from Sora 2")
      }

      return {
        videoUrl: video.url || video,
        duration: data.video?.duration || input.duration,
        width: data.video?.width || (input.aspect_ratio === '16:9' ? 1280 : 720),
        height: data.video?.height || (input.aspect_ratio === '16:9' ? 720 : 1280),
        fps: data.video?.fps || 30,
        metadata: {
          ...data,
          hasAudio: true, // Sora 2 always generates audio
          audioType: 'dialogue', // Built-in dialogue with lip sync
          model: 'sora-2',
        },
      }
    } catch (error: any) {
      console.error("FalSora2Adapter error:", error)
      if (error.body) {
        console.error("Error body:", JSON.stringify(error.body, null, 2))
      }
      throw new Error(`Sora 2 call failed: ${error.message}`)
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
    sora2: new FalSora2Adapter(), // New Sora 2 adapter
    tts: new FalTTSAdapter(),
  }
}
