/**
 * Fal.ai Adapter Implementation
 * Unified adapter for LLM, T2I, T2V, TTS using Fal.ai platform
 */

import * as fal from "@fal-ai/serverless-client"
import { cachedAPICall, generateCacheKey } from "./cache"
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
if (process.env.FAL_API_KEY || process.env.FAL_KEY) {
  fal.config({
    credentials: process.env.FAL_API_KEY || process.env.FAL_KEY,
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
    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      imageSize: request.imageSize,
      seed: request.seed,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
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
      },
      {
        description: `T2I: ${request.model} - ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

export class FalT2VAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    try {
      // Delegate to specialized adapters based on model
      if (request.model.includes('sora-2')) {
        const sora2Adapter = new FalSora2Adapter()
        return await sora2Adapter.call(request)
      }

      if (request.model.includes('vidu/q1/text-to-video')) {
        const viduQ1Adapter = new FalViduQ1T2VAdapter()
        return await viduQ1Adapter.call(request)
      }

      if (request.model.includes('vidu/q2/image-to-video')) {
        const viduQ2Adapter = new FalViduQ2I2VAdapter()
        return await viduQ2Adapter.call(request)
      }

      if (request.model.includes('vidu/reference-to-video')) {
        const viduReferenceAdapter = new FalViduReferenceAdapter()
        return await viduReferenceAdapter.call(request)
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
    const cacheKey = generateCacheKey({
      model: request.model,
      text: request.text,
      voice: request.voice,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
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
      },
      {
        description: `TTS: ${request.voice} - ${request.text.substring(0, 50)}...`
      }
    )
  }
}

/**
 * Sora 2 Adapter - Direct Text-to-Video with Audio
 * Supports: 4/8/12s duration, 16:9/9:16 aspect ratio, built-in audio
 */
export class FalSora2Adapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    // Prepare input parameters
    const input: any = {
      prompt: request.prompt,
    }

    // Duration: only 4, 8, or 12 seconds supported
    if (request.duration) {
      if (request.duration <= 4) {
        input.duration = 4
      } else if (request.duration <= 8) {
        input.duration = 8
      } else {
        input.duration = 12
      }
    } else {
      input.duration = 4
    }

    // Aspect ratio
    if (request.width && request.height) {
      const ratio = request.width / request.height
      input.aspect_ratio = ratio > 1 ? '16:9' : '9:16'
    } else {
      input.aspect_ratio = '16:9'
    }

    input.resolution = '720p'

    // Generate cache key
    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      duration: input.duration,
      aspectRatio: input.aspect_ratio,
      resolution: input.resolution,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
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
              hasAudio: true,
              audioType: 'dialogue',
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
      },
      {
        description: `Sora 2: ${input.duration}s - ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

// ============ Sora 2 Pro T2V Adapter ============

/**
 * Sora 2 Pro Text-to-Video Adapter
 * Premium version with better quality
 * Model: fal-ai/sora-2/text-to-video/pro
 * Duration: 4/8/12s
 * Resolution: 720p
 * Aspect Ratio: 16:9 or 9:16
 */
export class FalSora2ProAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    const input: any = {
      prompt: request.prompt,
    }

    // Duration: only 4, 8, or 12 seconds supported
    if (request.duration) {
      if (request.duration <= 4) {
        input.duration = 4
      } else if (request.duration <= 8) {
        input.duration = 8
      } else {
        input.duration = 12
      }
    } else {
      input.duration = 4
    }

    // Aspect ratio
    if (request.width && request.height) {
      const ratio = request.width / request.height
      input.aspect_ratio = ratio > 1 ? '16:9' : '9:16'
    } else {
      input.aspect_ratio = '16:9'
    }

    input.resolution = '720p'

    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      duration: input.duration,
      aspectRatio: input.aspect_ratio,
      resolution: input.resolution,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Sora 2 Pro Queue:", update.status, "Position:", update.queue_position)
            },
          })

          const data = result as any
          const video = data.video
          if (!video) {
            throw new Error("No video returned from Sora 2 Pro")
          }

          return {
            videoUrl: video.url || video,
            duration: data.video?.duration || input.duration,
            width: data.video?.width || (input.aspect_ratio === '16:9' ? 1280 : 720),
            height: data.video?.height || (input.aspect_ratio === '16:9' ? 720 : 1280),
            fps: data.video?.fps || 30,
            metadata: {
              ...data,
              hasAudio: true,
              model: 'sora-2-pro',
            },
          }
        } catch (error: any) {
          console.error("FalSora2ProAdapter error:", error)
          throw new Error(`Sora 2 Pro call failed: ${error.message}`)
        }
      },
      {
        description: `Sora 2 Pro: ${input.duration}s - ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

// ============ Sora 2 I2V Adapter ============

/**
 * Sora 2 Image-to-Video Adapter
 * Model: fal-ai/sora-2/image-to-video
 * Duration: 4/8/12s
 * Resolution: 720p
 * Supports first frame image input
 */
export class FalSora2I2VAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    if (!request.imageUrl) {
      throw new Error("Sora 2 I2V requires an imageUrl")
    }

    const input: any = {
      prompt: request.prompt,
      image_url: request.imageUrl,
    }

    // Duration: only 4, 8, or 12 seconds supported
    if (request.duration) {
      if (request.duration <= 4) {
        input.duration = 4
      } else if (request.duration <= 8) {
        input.duration = 8
      } else {
        input.duration = 12
      }
    } else {
      input.duration = 4
    }

    // Aspect ratio
    if (request.width && request.height) {
      const ratio = request.width / request.height
      input.aspect_ratio = ratio > 1 ? '16:9' : '9:16'
    } else {
      input.aspect_ratio = '16:9'
    }

    input.resolution = '720p'

    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      imageUrl: request.imageUrl,
      duration: input.duration,
      aspectRatio: input.aspect_ratio,
      resolution: input.resolution,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Sora 2 I2V Queue:", update.status, "Position:", update.queue_position)
            },
          })

          const data = result as any
          const video = data.video
          if (!video) {
            throw new Error("No video returned from Sora 2 I2V")
          }

          return {
            videoUrl: video.url || video,
            duration: data.video?.duration || input.duration,
            width: data.video?.width || (input.aspect_ratio === '16:9' ? 1280 : 720),
            height: data.video?.height || (input.aspect_ratio === '16:9' ? 720 : 1280),
            fps: data.video?.fps || 30,
            metadata: {
              ...data,
              hasAudio: true,
              model: 'sora-2-i2v',
            },
          }
        } catch (error: any) {
          console.error("FalSora2I2VAdapter error:", error)
          throw new Error(`Sora 2 I2V call failed: ${error.message}`)
        }
      },
      {
        description: `Sora 2 I2V: ${input.duration}s - ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

// ============ Sora 2 I2V Pro Adapter ============

/**
 * Sora 2 Image-to-Video Pro Adapter
 * Premium version with better quality
 * Model: fal-ai/sora-2/image-to-video/pro
 * Duration: 4/8/12s
 * Resolution: 720p
 */
export class FalSora2I2VProAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    if (!request.imageUrl) {
      throw new Error("Sora 2 I2V Pro requires an imageUrl")
    }

    const input: any = {
      prompt: request.prompt,
      image_url: request.imageUrl,
    }

    // Duration: only 4, 8, or 12 seconds supported
    if (request.duration) {
      if (request.duration <= 4) {
        input.duration = 4
      } else if (request.duration <= 8) {
        input.duration = 8
      } else {
        input.duration = 12
      }
    } else {
      input.duration = 4
    }

    // Aspect ratio
    if (request.width && request.height) {
      const ratio = request.width / request.height
      input.aspect_ratio = ratio > 1 ? '16:9' : '9:16'
    } else {
      input.aspect_ratio = '16:9'
    }

    input.resolution = '720p'

    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      imageUrl: request.imageUrl,
      duration: input.duration,
      aspectRatio: input.aspect_ratio,
      resolution: input.resolution,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Sora 2 I2V Pro Queue:", update.status, "Position:", update.queue_position)
            },
          })

          const data = result as any
          const video = data.video
          if (!video) {
            throw new Error("No video returned from Sora 2 I2V Pro")
          }

          return {
            videoUrl: video.url || video,
            duration: data.video?.duration || input.duration,
            width: data.video?.width || (input.aspect_ratio === '16:9' ? 1280 : 720),
            height: data.video?.height || (input.aspect_ratio === '16:9' ? 720 : 1280),
            fps: data.video?.fps || 30,
            metadata: {
              ...data,
              hasAudio: true,
              model: 'sora-2-i2v-pro',
            },
          }
        } catch (error: any) {
          console.error("FalSora2I2VProAdapter error:", error)
          throw new Error(`Sora 2 I2V Pro call failed: ${error.message}`)
        }
      },
      {
        description: `Sora 2 I2V Pro: ${input.duration}s - ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

// ============ Sora 2 Remix Adapter ============

/**
 * Sora 2 Remix Video-to-Video Adapter
 * Transform existing videos with new prompts
 * Model: fal-ai/sora-2/video-to-video/remix
 * Duration: 4/8/12s
 * Resolution: 720p
 */
export class FalSora2RemixAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    if (!request.videoUrl) {
      throw new Error("Sora 2 Remix requires a videoUrl")
    }

    const input: any = {
      prompt: request.prompt,
      video_url: request.videoUrl,
    }

    // Duration: only 4, 8, or 12 seconds supported
    if (request.duration) {
      if (request.duration <= 4) {
        input.duration = 4
      } else if (request.duration <= 8) {
        input.duration = 8
      } else {
        input.duration = 12
      }
    } else {
      input.duration = 4
    }

    // Aspect ratio
    if (request.width && request.height) {
      const ratio = request.width / request.height
      input.aspect_ratio = ratio > 1 ? '16:9' : '9:16'
    } else {
      input.aspect_ratio = '16:9'
    }

    input.resolution = '720p'

    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      videoUrl: request.videoUrl,
      duration: input.duration,
      aspectRatio: input.aspect_ratio,
      resolution: input.resolution,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Sora 2 Remix Queue:", update.status, "Position:", update.queue_position)
            },
          })

          const data = result as any
          const video = data.video
          if (!video) {
            throw new Error("No video returned from Sora 2 Remix")
          }

          return {
            videoUrl: video.url || video,
            duration: data.video?.duration || input.duration,
            width: data.video?.width || (input.aspect_ratio === '16:9' ? 1280 : 720),
            height: data.video?.height || (input.aspect_ratio === '16:9' ? 720 : 1280),
            fps: data.video?.fps || 30,
            metadata: {
              ...data,
              hasAudio: true,
              model: 'sora-2-remix',
            },
          }
        } catch (error: any) {
          console.error("FalSora2RemixAdapter error:", error)
          throw new Error(`Sora 2 Remix call failed: ${error.message}`)
        }
      },
      {
        description: `Sora 2 Remix: ${input.duration}s - ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

/**
 * Vidu Q1 Text-to-Video Adapter
 * Pure T2V, fixed duration, 1080p quality
 */
export class FalViduQ1T2VAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    const input: any = {
      prompt: request.prompt,
    }

    // Aspect ratio
    if (request.aspectRatio) {
      input.aspect_ratio = request.aspectRatio
    } else if (request.width && request.height) {
      const ratio = request.width / request.height
      if (ratio > 1.5) input.aspect_ratio = '16:9'
      else if (ratio < 0.7) input.aspect_ratio = '9:16'
      else input.aspect_ratio = '1:1'
    } else {
      input.aspect_ratio = '16:9'
    }

    // Movement amplitude
    input.movement_amplitude = request.movementAmplitude || 'auto'

    // Style (general or anime)
    input.style = request.style || 'general'

    // Seed for reproducibility
    if (request.seed) {
      input.seed = request.seed
    }

    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      aspectRatio: input.aspect_ratio,
      movementAmplitude: input.movement_amplitude,
      style: input.style,
      seed: input.seed,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          console.log("[FalViduQ1T2V] Calling with input:", JSON.stringify(input, null, 2))

          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Vidu Q1 T2V Queue:", update.status, "Position:", update.queue_position)
            },
          })

          const data = result as any
          console.log("[FalViduQ1T2V] Response data:", JSON.stringify(data, null, 2))

          const video = data.video
          if (!video) {
            console.error("[FalViduQ1T2V] Unexpected response format:", data)
            throw new Error("No video returned from Vidu Q1 T2V")
          }

          return {
            videoUrl: video.url || video,
            duration: request.duration || 4, // Q1 T2V has fixed duration, default to 4s
            width: 1920,
            height: input.aspect_ratio === '16:9' ? 1080 : input.aspect_ratio === '9:16' ? 1920 : 1080,
            fps: 30,
            metadata: {
              ...data,
              model: 'vidu-q1-t2v',
            },
          }
        } catch (error: any) {
          console.error("FalViduQ1T2VAdapter error:", error)
          if (error.body) {
            console.error("Error body:", JSON.stringify(error.body, null, 2))
          }
          throw new Error(`Vidu Q1 T2V call failed: ${error.message}`)
        }
      },
      {
        description: `Vidu Q1 T2V: ${input.aspect_ratio} - ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

/**
 * Vidu Q2 Image-to-Video Pro Adapter
 * I2V with duration control (2-8s), 720p/1080p quality
 */
export class FalViduQ2I2VAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    if (!request.imageUrl) {
      throw new Error("Vidu Q2 I2V requires an image_url")
    }

    const input: any = {
      prompt: request.prompt,
      image_url: request.imageUrl,
    }

    // Duration: 2-8 seconds
    if (request.duration) {
      input.duration = Math.max(2, Math.min(8, Math.round(request.duration)))
    } else {
      input.duration = 4
    }

    // Resolution
    if (request.resolution) {
      input.resolution = request.resolution
    } else {
      input.resolution = '720p'
    }

    // Aspect ratio
    if (request.aspectRatio) {
      input.aspect_ratio = request.aspectRatio
    } else if (request.width && request.height) {
      const ratio = request.width / request.height
      if (ratio > 1.5) input.aspect_ratio = '16:9'
      else if (ratio < 0.7) input.aspect_ratio = '9:16'
      else input.aspect_ratio = '1:1'
    } else {
      input.aspect_ratio = '16:9'
    }

    // Movement amplitude
    input.movement_amplitude = request.movementAmplitude || 'auto'

    // BGM (only for 4-second videos)
    input.bgm = request.bgm || false

    // Seed
    if (request.seed) {
      input.seed = request.seed
    }

    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      imageUrl: request.imageUrl,
      duration: input.duration,
      resolution: input.resolution,
      aspectRatio: input.aspect_ratio,
      movementAmplitude: input.movement_amplitude,
      seed: input.seed,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          console.log("[FalViduQ2I2V] Calling with input:", JSON.stringify(input, null, 2))

          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Vidu Q2 I2V Queue:", update.status, "Position:", update.queue_position)
            },
          })

          const data = result as any
          console.log("[FalViduQ2I2V] Response data:", JSON.stringify(data, null, 2))

          const video = data.video
          if (!video) {
            console.error("[FalViduQ2I2V] Unexpected response format:", data)
            throw new Error("No video returned from Vidu Q2 I2V")
          }

          // Resolution to dimensions
          const resolutionMap: Record<string, { width: number; height: number }> = {
            '360p': { width: 640, height: 360 },
            '520p': { width: 924, height: 520 },
            '720p': { width: 1280, height: 720 },
            '1080p': { width: 1920, height: 1080 },
          }

          const dimensions = resolutionMap[input.resolution] || resolutionMap['720p']
          const width = input.aspect_ratio === '9:16' ? dimensions.height : dimensions.width
          const height = input.aspect_ratio === '9:16' ? dimensions.width : dimensions.height

          return {
            videoUrl: video.url || video,
            duration: input.duration,
            width,
            height,
            fps: 30,
            metadata: {
              ...data,
              model: 'vidu-q2-i2v',
            },
          }
        } catch (error: any) {
          console.error("FalViduQ2I2VAdapter error:", error)
          if (error.body) {
            console.error("Error body:", JSON.stringify(error.body, null, 2))
          }
          throw new Error(`Vidu Q2 I2V call failed: ${error.message}`)
        }
      },
      {
        description: `Vidu Q2 I2V: ${input.duration}s ${input.resolution} - ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

/**
 * Vidu Reference-to-Video Adapter
 * Multi-image reference for consistent character generation
 */
export class FalViduReferenceAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    if (!request.referenceImageUrls || request.referenceImageUrls.length === 0) {
      throw new Error("Vidu Reference requires at least one reference_image_url")
    }

    const input: any = {
      prompt: request.prompt,
      reference_image_urls: request.referenceImageUrls,
    }

    // Aspect ratio
    if (request.aspectRatio) {
      input.aspect_ratio = request.aspectRatio
    } else if (request.width && request.height) {
      const ratio = request.width / request.height
      if (ratio > 1.5) input.aspect_ratio = '16:9'
      else if (ratio < 0.7) input.aspect_ratio = '9:16'
      else input.aspect_ratio = '1:1'
    } else {
      input.aspect_ratio = '16:9'
    }

    // Movement amplitude
    input.movement_amplitude = request.movementAmplitude || 'auto'

    // Seed
    if (request.seed) {
      input.seed = request.seed
    }

    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      referenceImages: request.referenceImageUrls.join(','),
      aspectRatio: input.aspect_ratio,
      movementAmplitude: input.movement_amplitude,
      seed: input.seed,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          console.log("[FalViduReference] Calling with input:", JSON.stringify(input, null, 2))

          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Vidu Reference Queue:", update.status, "Position:", update.queue_position)
            },
          })

          const data = result as any
          console.log("[FalViduReference] Response data:", JSON.stringify(data, null, 2))

          const video = data.video
          if (!video) {
            console.error("[FalViduReference] Unexpected response format:", data)
            throw new Error("No video returned from Vidu Reference")
          }

          return {
            videoUrl: video.url || video,
            duration: request.duration || 4,
            width: input.aspect_ratio === '16:9' ? 1920 : input.aspect_ratio === '9:16' ? 1080 : 1920,
            height: input.aspect_ratio === '16:9' ? 1080 : input.aspect_ratio === '9:16' ? 1920 : 1080,
            fps: 30,
            metadata: {
              ...data,
              model: 'vidu-reference',
            },
          }
        } catch (error: any) {
          console.error("FalViduReferenceAdapter error:", error)
          if (error.body) {
            console.error("Error body:", JSON.stringify(error.body, null, 2))
          }
          throw new Error(`Vidu Reference call failed: ${error.message}`)
        }
      },
      {
        description: `Vidu Reference: ${request.referenceImageUrls.length} images - ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

// ============ Veo 3.1 Adapters ============

/**
 * Veo 3.1 First/Last Frame to Video Adapter (Standard)
 * Supports first and last frame control for perfect continuity between segments
 * Model: fal-ai/veo3.1/first-last-frame-to-video
 * Duration: 8s fixed
 * Resolution: 720p or 1080p
 * Audio: Optional (saves 33% credits if disabled)
 * Price: $0.40/second (audio on), $0.20/second (audio off)
 */
export class FalVeo31FirstLastFrameAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    if (!request.firstFrameUrl || !request.lastFrameUrl) {
      throw new Error("Veo 3.1 First/Last Frame requires both firstFrameUrl and lastFrameUrl")
    }

    const input: any = {
      first_frame_url: request.firstFrameUrl,
      last_frame_url: request.lastFrameUrl,
      prompt: request.prompt,
      duration: "8s", // Fixed 8 seconds
      aspect_ratio: request.aspectRatio || "auto",
      resolution: request.resolution || "720p",
      generate_audio: request.generateAudio !== false, // Default true
    }

    const cacheKey = generateCacheKey({
      model: request.model,
      firstFrame: request.firstFrameUrl,
      lastFrame: request.lastFrameUrl,
      prompt: request.prompt,
      resolution: input.resolution,
      generateAudio: input.generate_audio,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          console.log("[FalVeo31FirstLastFrame] Calling with input:", JSON.stringify(input, null, 2))

          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Veo 3.1 FirstLastFrame Queue:", update.status, "Position:", update.queue_position)
            },
          })

          const data = result as any
          console.log("[FalVeo31FirstLastFrame] Response data:", JSON.stringify(data, null, 2))

          const video = data.video
          if (!video) {
            console.error("[FalVeo31FirstLastFrame] Unexpected response format:", data)
            throw new Error("No video returned from Veo 3.1 First/Last Frame")
          }

          return {
            videoUrl: video.url || video,
            duration: 8,
            width: input.resolution === '1080p' ? 1920 : 1280,
            height: input.resolution === '1080p' ? 1080 : 720,
            fps: 30,
            metadata: {
              ...data,
              model: 'veo3.1-first-last-frame',
              hasAudio: input.generate_audio,
            },
          }
        } catch (error: any) {
          console.error("FalVeo31FirstLastFrameAdapter error:", error)
          if (error.body) {
            console.error("Error body:", JSON.stringify(error.body, null, 2))
          }
          throw new Error(`Veo 3.1 First/Last Frame call failed: ${error.message}`)
        }
      },
      {
        description: `Veo 3.1 FirstLastFrame: ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

/**
 * Veo 3.1 Fast First/Last Frame to Video Adapter
 * Fast variant with lower cost
 * Price: $0.15/second (audio on), $0.10/second (audio off)
 */
export class FalVeo31FastFirstLastFrameAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    if (!request.firstFrameUrl || !request.lastFrameUrl) {
      throw new Error("Veo 3.1 Fast First/Last Frame requires both firstFrameUrl and lastFrameUrl")
    }

    const input: any = {
      first_frame_url: request.firstFrameUrl,
      last_frame_url: request.lastFrameUrl,
      prompt: request.prompt,
      duration: "8s",
      aspect_ratio: request.aspectRatio || "auto",
      resolution: request.resolution || "720p",
      generate_audio: request.generateAudio !== false,
    }

    const cacheKey = generateCacheKey({
      model: request.model,
      firstFrame: request.firstFrameUrl,
      lastFrame: request.lastFrameUrl,
      prompt: request.prompt,
      resolution: input.resolution,
      generateAudio: input.generate_audio,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Veo 3.1 Fast FirstLastFrame Queue:", update.status)
            },
          })

          const data = result as any
          const video = data.video
          if (!video) {
            throw new Error("No video returned from Veo 3.1 Fast First/Last Frame")
          }

          return {
            videoUrl: video.url || video,
            duration: 8,
            width: input.resolution === '1080p' ? 1920 : 1280,
            height: input.resolution === '1080p' ? 1080 : 720,
            fps: 30,
            metadata: {
              ...data,
              model: 'veo3.1-fast-first-last-frame',
              hasAudio: input.generate_audio,
            },
          }
        } catch (error: any) {
          console.error("FalVeo31FastFirstLastFrameAdapter error:", error)
          throw new Error(`Veo 3.1 Fast First/Last Frame call failed: ${error.message}`)
        }
      },
      {
        description: `Veo 3.1 Fast FirstLastFrame: ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

// ============ Veo 3.1 Standard T2V Adapter ============

/**
 * Veo 3.1 Standard Text-to-Video Adapter
 * Google's premium T2V model
 * Model: fal-ai/veo-3-1
 * Duration: 8s (fixed)
 * Resolution: 720p or 1080p
 * Price: $0.40/second
 */
export class FalVeo31T2VAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    const input: any = {
      prompt: request.prompt,
      duration: "8s", // Fixed 8 seconds
      aspect_ratio: request.aspectRatio || "auto",
      resolution: request.resolution || "720p",
      generate_audio: request.generateAudio !== false, // Default true
    }

    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      resolution: input.resolution,
      generateAudio: input.generate_audio,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Veo 3.1 T2V Queue:", update.status, "Position:", update.queue_position)
            },
          })

          const data = result as any
          const video = data.video
          if (!video) {
            throw new Error("No video returned from Veo 3.1 T2V")
          }

          return {
            videoUrl: video.url || video,
            duration: 8,
            width: input.resolution === '1080p' ? 1920 : 1280,
            height: input.resolution === '1080p' ? 1080 : 720,
            fps: 30,
            metadata: {
              ...data,
              model: 'veo3.1-t2v',
              hasAudio: input.generate_audio,
            },
          }
        } catch (error: any) {
          console.error("FalVeo31T2VAdapter error:", error)
          throw new Error(`Veo 3.1 T2V call failed: ${error.message}`)
        }
      },
      {
        description: `Veo 3.1 T2V: ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

// ============ Veo 3.1 Standard I2V Adapter ============

/**
 * Veo 3.1 Standard Image-to-Video Adapter
 * Google's premium I2V model
 * Model: fal-ai/veo-3-1/image-to-video
 * Duration: 8s (fixed)
 * Resolution: 720p or 1080p
 * Price: $0.40/second
 */
export class FalVeo31I2VAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    if (!request.imageUrl) {
      throw new Error("Veo 3.1 I2V requires an imageUrl")
    }

    const input: any = {
      image_url: request.imageUrl,
      prompt: request.prompt,
      duration: "8s", // Fixed 8 seconds
      aspect_ratio: request.aspectRatio || "auto",
      resolution: request.resolution || "720p",
      generate_audio: request.generateAudio !== false, // Default true
    }

    const cacheKey = generateCacheKey({
      model: request.model,
      imageUrl: request.imageUrl,
      prompt: request.prompt,
      resolution: input.resolution,
      generateAudio: input.generate_audio,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Veo 3.1 I2V Queue:", update.status, "Position:", update.queue_position)
            },
          })

          const data = result as any
          const video = data.video
          if (!video) {
            throw new Error("No video returned from Veo 3.1 I2V")
          }

          return {
            videoUrl: video.url || video,
            duration: 8,
            width: input.resolution === '1080p' ? 1920 : 1280,
            height: input.resolution === '1080p' ? 1080 : 720,
            fps: 30,
            metadata: {
              ...data,
              model: 'veo3.1-i2v',
              hasAudio: input.generate_audio,
            },
          }
        } catch (error: any) {
          console.error("FalVeo31I2VAdapter error:", error)
          throw new Error(`Veo 3.1 I2V call failed: ${error.message}`)
        }
      },
      {
        description: `Veo 3.1 I2V: ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

// ============ Veo 3.1 Reference Adapter ============

/**
 * Veo 3.1 Reference-to-Video Adapter
 * Multi-image reference input for character consistency
 * Model: fal-ai/veo-3-1/reference-to-video
 * Duration: 8s (fixed)
 * Resolution: 720p or 1080p
 * Supports multiple reference images for character/style consistency
 * Price: $0.40/second
 */
export class FalVeo31ReferenceAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    if (!request.referenceImageUrls || request.referenceImageUrls.length === 0) {
      throw new Error("Veo 3.1 Reference requires at least one reference image URL")
    }

    const input: any = {
      reference_image_urls: request.referenceImageUrls,
      prompt: request.prompt,
      duration: "8s", // Fixed 8 seconds
      aspect_ratio: request.aspectRatio || "auto",
      resolution: request.resolution || "720p",
      generate_audio: request.generateAudio !== false, // Default true
    }

    const cacheKey = generateCacheKey({
      model: request.model,
      referenceImages: request.referenceImageUrls.join(','),
      prompt: request.prompt,
      resolution: input.resolution,
      generateAudio: input.generate_audio,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Veo 3.1 Reference Queue:", update.status, "Position:", update.queue_position)
            },
          })

          const data = result as any
          const video = data.video
          if (!video) {
            throw new Error("No video returned from Veo 3.1 Reference")
          }

          return {
            videoUrl: video.url || video,
            duration: 8,
            width: input.resolution === '1080p' ? 1920 : 1280,
            height: input.resolution === '1080p' ? 1080 : 720,
            fps: 30,
            metadata: {
              ...data,
              model: 'veo3.1-reference',
              hasAudio: input.generate_audio,
              referenceImageCount: request.referenceImageUrls.length,
            },
          }
        } catch (error: any) {
          console.error("FalVeo31ReferenceAdapter error:", error)
          throw new Error(`Veo 3.1 Reference call failed: ${error.message}`)
        }
      },
      {
        description: `Veo 3.1 Reference (${request.referenceImageUrls.length} images): ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

// ============ Veo 3.1 Fast T2V Adapter ============

/**
 * Veo 3.1 Fast Text-to-Video Adapter
 * Faster, cheaper version of Veo 3.1 T2V
 * Model: fal-ai/veo-3-1/fast
 * Duration: 8s (fixed)
 * Resolution: 720p or 1080p
 * Price: $0.15/second (62.5% cheaper than standard)
 */
export class FalVeo31FastT2VAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    const input: any = {
      prompt: request.prompt,
      duration: "8s", // Fixed 8 seconds
      aspect_ratio: request.aspectRatio || "auto",
      resolution: request.resolution || "720p",
      generate_audio: request.generateAudio !== false, // Default true
    }

    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      resolution: input.resolution,
      generateAudio: input.generate_audio,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Veo 3.1 Fast T2V Queue:", update.status, "Position:", update.queue_position)
            },
          })

          const data = result as any
          const video = data.video
          if (!video) {
            throw new Error("No video returned from Veo 3.1 Fast T2V")
          }

          return {
            videoUrl: video.url || video,
            duration: 8,
            width: input.resolution === '1080p' ? 1920 : 1280,
            height: input.resolution === '1080p' ? 1080 : 720,
            fps: 30,
            metadata: {
              ...data,
              model: 'veo3.1-fast-t2v',
              hasAudio: input.generate_audio,
            },
          }
        } catch (error: any) {
          console.error("FalVeo31FastT2VAdapter error:", error)
          throw new Error(`Veo 3.1 Fast T2V call failed: ${error.message}`)
        }
      },
      {
        description: `Veo 3.1 Fast T2V: ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

// ============ Veo 3.1 Fast I2V Adapter ============

/**
 * Veo 3.1 Fast Image-to-Video Adapter
 * Faster, cheaper version of Veo 3.1 I2V
 * Model: fal-ai/veo-3-1/fast/image-to-video
 * Duration: 8s (fixed)
 * Resolution: 720p or 1080p
 * Price: $0.15/second (62.5% cheaper than standard)
 */
export class FalVeo31FastI2VAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    if (!request.imageUrl) {
      throw new Error("Veo 3.1 Fast I2V requires an imageUrl")
    }

    const input: any = {
      image_url: request.imageUrl,
      prompt: request.prompt,
      duration: "8s", // Fixed 8 seconds
      aspect_ratio: request.aspectRatio || "auto",
      resolution: request.resolution || "720p",
      generate_audio: request.generateAudio !== false, // Default true
    }

    const cacheKey = generateCacheKey({
      model: request.model,
      imageUrl: request.imageUrl,
      prompt: request.prompt,
      resolution: input.resolution,
      generateAudio: input.generate_audio,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Veo 3.1 Fast I2V Queue:", update.status, "Position:", update.queue_position)
            },
          })

          const data = result as any
          const video = data.video
          if (!video) {
            throw new Error("No video returned from Veo 3.1 Fast I2V")
          }

          return {
            videoUrl: video.url || video,
            duration: 8,
            width: input.resolution === '1080p' ? 1920 : 1280,
            height: input.resolution === '1080p' ? 1080 : 720,
            fps: 30,
            metadata: {
              ...data,
              model: 'veo3.1-fast-i2v',
              hasAudio: input.generate_audio,
            },
          }
        } catch (error: any) {
          console.error("FalVeo31FastI2VAdapter error:", error)
          throw new Error(`Veo 3.1 Fast I2V call failed: ${error.message}`)
        }
      },
      {
        description: `Veo 3.1 Fast I2V: ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

// ============ Wan 2.5 Adapter ============

/**
 * Wan 2.5 Image-to-Video Adapter
 * Best open source model with audio support
 * Model: fal-ai/wan-25-preview/image-to-video
 * Duration: 5s or 10s
 * Resolution: 480p, 720p, or 1080p
 * Audio: Optional background music support
 * Price: $0.05/s (480p), $0.10/s (720p), $0.15/s (1080p)
 */
export class FalWan25Adapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    if (!request.imageUrl) {
      throw new Error("Wan 2.5 requires an imageUrl for I2V")
    }

    const input: any = {
      prompt: request.prompt,
      image_url: request.imageUrl,
      duration: request.duration || 5, // 5 or 10
      resolution: request.resolution || "1080p",
      negative_prompt: request.negativePrompt,
      audio_url: request.audioUrl, // Optional background music
      enable_prompt_expansion: request.enablePromptExpansion !== false, // Default true
      seed: request.seed,
      enable_safety_checker: request.enableSafetyChecker !== false,
    }

    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      imageUrl: request.imageUrl,
      duration: input.duration,
      resolution: input.resolution,
      audioUrl: input.audio_url,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          console.log("[FalWan25] Calling with input:", JSON.stringify(input, null, 2))

          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Wan 2.5 Queue:", update.status)
            },
          })

          const data = result as any
          const video = data.video
          if (!video) {
            throw new Error("No video returned from Wan 2.5")
          }

          return {
            videoUrl: video.url || video,
            duration: input.duration,
            width: input.resolution === '1080p' ? 1920 : input.resolution === '720p' ? 1280 : 854,
            height: input.resolution === '1080p' ? 1080 : input.resolution === '720p' ? 720 : 480,
            fps: 30,
            metadata: {
              ...data,
              model: 'wan-2.5',
              hasAudio: !!input.audio_url,
            },
          }
        } catch (error: any) {
          console.error("FalWan25Adapter error:", error)
          throw new Error(`Wan 2.5 call failed: ${error.message}`)
        }
      },
      {
        description: `Wan 2.5: ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

// ============ Seedance Adapters ============

/**
 * Seedance 1.0 Pro Fast Text-to-Video Adapter
 * Ultra-cheap T2V with precise duration control (2-12s)
 * Model: fal-ai/bytedance/seedance/v1/pro/fast/text-to-video
 * Duration: 2-12 seconds (precise control!)
 * Resolution: 480p, 720p, or 1080p
 * Price: ~$0.05/second
 */
export class FalSeedanceT2VAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    const input: any = {
      prompt: request.prompt,
      aspect_ratio: request.aspectRatio || "16:9",
      resolution: request.resolution || "1080p",
      duration: request.duration || 5, // 2-12 seconds
      camera_fixed: request.cameraFixed || false,
      seed: request.seed || -1, // -1 for random
      enable_safety_checker: request.enableSafetyChecker !== false,
    }

    const cacheKey = generateCacheKey({
      model: request.model,
      prompt: request.prompt,
      duration: input.duration,
      resolution: input.resolution,
      aspectRatio: input.aspect_ratio,
      cameraFixed: input.camera_fixed,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Seedance T2V Queue:", update.status)
            },
          })

          const data = result as any
          const video = data.video
          if (!video) {
            throw new Error("No video returned from Seedance T2V")
          }

          return {
            videoUrl: video.url || video,
            duration: input.duration,
            width: input.resolution === '1080p' ? 1920 : input.resolution === '720p' ? 1280 : 854,
            height: input.resolution === '1080p' ? 1080 : input.resolution === '720p' ? 720 : 480,
            fps: 30,
            metadata: {
              ...data,
              model: 'seedance-t2v',
            },
          }
        } catch (error: any) {
          console.error("FalSeedanceT2VAdapter error:", error)
          throw new Error(`Seedance T2V call failed: ${error.message}`)
        }
      },
      {
        description: `Seedance T2V: ${request.prompt.substring(0, 50)}...`
      }
    )
  }
}

/**
 * Seedance 1.0 Pro Fast Image-to-Video Adapter
 * Ultra-cheap I2V with precise duration control (2-12s)
 * Model: fal-ai/bytedance/seedance/v1/pro/fast/image-to-video
 */
export class FalSeedanceI2VAdapter implements IT2VAdapter {
  async call(request: T2VRequest): Promise<T2VResponse> {
    if (!request.imageUrl) {
      throw new Error("Seedance I2V requires an imageUrl")
    }

    const input: any = {
      image_url: request.imageUrl,
      prompt: request.prompt,
      aspect_ratio: request.aspectRatio || "auto",
      resolution: request.resolution || "1080p",
      duration: request.duration || 5, // 2-12 seconds
      camera_fixed: request.cameraFixed || false,
      seed: request.seed || -1,
      enable_safety_checker: request.enableSafetyChecker !== false,
    }

    const cacheKey = generateCacheKey({
      model: request.model,
      imageUrl: request.imageUrl,
      prompt: request.prompt,
      duration: input.duration,
      resolution: input.resolution,
    })

    return cachedAPICall(
      cacheKey,
      async () => {
        try {
          const result = await fal.subscribe(request.model, {
            input,
            logs: true,
            onQueueUpdate: (update) => {
              console.log("Seedance I2V Queue:", update.status)
            },
          })

          const data = result as any
          const video = data.video
          if (!video) {
            throw new Error("No video returned from Seedance I2V")
          }

          return {
            videoUrl: video.url || video,
            duration: input.duration,
            width: input.resolution === '1080p' ? 1920 : input.resolution === '720p' ? 1280 : 854,
            height: input.resolution === '1080p' ? 1080 : input.resolution === '720p' ? 720 : 480,
            fps: 30,
            metadata: {
              ...data,
              model: 'seedance-i2v',
            },
          }
        } catch (error: any) {
          console.error("FalSeedanceI2VAdapter error:", error)
          throw new Error(`Seedance I2V call failed: ${error.message}`)
        }
      },
      {
        description: `Seedance I2V: ${request.prompt.substring(0, 50)}...`
      }
    )
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

    // Sora 2 models (5 variants)
    sora2: new FalSora2Adapter(),
    sora2Pro: new FalSora2ProAdapter(),
    sora2I2V: new FalSora2I2VAdapter(),
    sora2I2VPro: new FalSora2I2VProAdapter(),
    sora2Remix: new FalSora2RemixAdapter(),

    // Vidu models (3 variants)
    viduQ1T2V: new FalViduQ1T2VAdapter(),
    viduQ2I2V: new FalViduQ2I2VAdapter(),
    viduReference: new FalViduReferenceAdapter(),

    // Veo 3.1 models (7 variants)
    veo31T2V: new FalVeo31T2VAdapter(),
    veo31I2V: new FalVeo31I2VAdapter(),
    veo31Reference: new FalVeo31ReferenceAdapter(),
    veo31FirstLastFrame: new FalVeo31FirstLastFrameAdapter(),
    veo31FastT2V: new FalVeo31FastT2VAdapter(),
    veo31FastI2V: new FalVeo31FastI2VAdapter(),
    veo31FastFirstLastFrame: new FalVeo31FastFirstLastFrameAdapter(),

    // Wan 2.5 (1 variant)
    wan25: new FalWan25Adapter(),

    // Seedance (2 variants)
    seedanceT2V: new FalSeedanceT2VAdapter(),
    seedanceI2V: new FalSeedanceI2VAdapter(),

    tts: new FalTTSAdapter(),
  }
}
