/**
 * Shotstack Video Merging Adapter
 *
 * Handles multi-scene video concatenation with:
 * - Fade transitions between scenes
 * - Audio mixing (video soundtrack + optional TTS voiceover)
 * - Polling for render completion
 */

import type {
  ShotstackVideoClip,
  ShotstackMergeRequest,
  ShotstackMergeResponse,
  ShotstackRenderResponse,
  ShotstackStatusResponse,
} from './types'

const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY
const SHOTSTACK_ENV = process.env.SHOTSTACK_ENV || 'sandbox' // 'sandbox' or 'v1'
const SHOTSTACK_BASE_URL = `https://api.shotstack.io/${SHOTSTACK_ENV}`

const MAX_POLL_ATTEMPTS = 60 // 60 attempts * 5s = 5 minutes max
const POLL_INTERVAL_MS = 5000 // 5 seconds

export class ShotstackAdapter {
  /**
   * Merge multiple video clips into a single video
   */
  async mergeVideos(request: ShotstackMergeRequest): Promise<ShotstackMergeResponse> {
    console.log('[Shotstack] Merging videos:', {
      clipCount: request.videos.length,
      hasAudio: !!request.audioUrl,
      transition: request.transitions?.type || 'fade',
    })

    if (!SHOTSTACK_API_KEY) {
      throw new Error('SHOTSTACK_API_KEY is not configured in environment variables')
    }

    // Step 1: Build timeline JSON
    const timeline = this.buildTimeline(request)
    const output = this.buildOutput(request)

    // Step 2: Submit render job
    const renderId = await this.submitRender(timeline, output)

    // Step 3: Poll for completion
    const result = await this.pollRenderStatus(renderId)

    return {
      finalVideoUrl: result.url!,
      duration: result.duration,
      width: this.getResolutionWidth(request.output?.resolution || 'hd'),
      height: this.getResolutionHeight(request.output?.resolution || 'hd'),
      metadata: {
        renderId: result.id,
        renderTime: result.renderTime || 0,
        clipCount: request.videos.length,
      },
    }
  }

  /**
   * Build Shotstack timeline JSON
   */
  private buildTimeline(request: ShotstackMergeRequest): any {
    const { videos, audioUrl, transitions } = request
    const transitionType = transitions?.type || 'fade'
    const transitionDuration = transitions?.duration || 0.5 // default 0.5s

    // Track 0: Video clips (concatenated sequentially)
    const videoClips: any[] = []
    let currentTime = 0

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]

      videoClips.push({
        asset: {
          type: 'video',
          src: video.url,
        },
        start: currentTime,
        length: video.duration,
        transition: {
          in: i === 0 ? 'fade' : transitionType, // First clip always fade-in
          out: i === videos.length - 1 ? 'fade' : transitionType, // Last clip always fade-out
        },
      })

      currentTime += video.duration
    }

    const tracks: any[] = [
      {
        clips: videoClips,
      },
    ]

    // Track 1: Audio overlay (if TTS voiceover provided)
    if (audioUrl) {
      tracks.push({
        clips: [
          {
            asset: {
              type: 'audio',
              src: audioUrl,
            },
            start: 0,
            length: 'end', // Play for entire video duration
            volume: 0.8, // Slightly reduce voiceover to mix with video audio
          },
        ],
      })
    }

    return {
      background: '#000000',
      tracks,
    }
  }

  /**
   * Build Shotstack output configuration
   */
  private buildOutput(request: ShotstackMergeRequest): any {
    return {
      format: request.output?.format || 'mp4',
      resolution: request.output?.resolution || 'hd', // 1280x720
      fps: request.output?.fps || 30,
      quality: request.output?.quality || 'high',
    }
  }

  /**
   * Submit render job to Shotstack API
   */
  private async submitRender(timeline: any, output: any): Promise<string> {
    console.log('[Shotstack] Submitting render job...')

    const response = await fetch(`${SHOTSTACK_BASE_URL}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': SHOTSTACK_API_KEY!,
      },
      body: JSON.stringify({
        timeline,
        output,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Shotstack render submission failed: ${response.status} ${error}`)
    }

    const data: ShotstackRenderResponse = await response.json()

    if (!data.success) {
      throw new Error(`Shotstack render failed: ${data.message}`)
    }

    console.log('[Shotstack] Render job submitted:', data.response.id)
    return data.response.id
  }

  /**
   * Poll render status until completion or failure
   */
  private async pollRenderStatus(renderId: string): Promise<ShotstackStatusResponse['response']> {
    console.log('[Shotstack] Polling render status...')

    for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
      const response = await fetch(`${SHOTSTACK_BASE_URL}/render/${renderId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'x-api-key': SHOTSTACK_API_KEY!,
        },
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Shotstack status check failed: ${response.status} ${error}`)
      }

      const data: ShotstackStatusResponse = await response.json()
      const status = data.response.status

      console.log(`[Shotstack] Attempt ${attempt}/${MAX_POLL_ATTEMPTS} - Status: ${status}`)

      if (status === 'done') {
        if (!data.response.url) {
          throw new Error('Shotstack render completed but no URL provided')
        }
        console.log('[Shotstack] Render completed:', data.response.url)
        return data.response
      }

      if (status === 'failed') {
        throw new Error(`Shotstack render failed: ${data.response.error || 'Unknown error'}`)
      }

      // Status is queued/fetching/rendering/saving - wait and retry
      await this.sleep(POLL_INTERVAL_MS)
    }

    throw new Error(`Shotstack render timeout after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s`)
  }

  /**
   * Helper: Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Helper: Get width for resolution preset
   */
  private getResolutionWidth(resolution: string): number {
    const widths: Record<string, number> = {
      preview: 512,
      mobile: 640,
      sd: 1024,
      hd: 1280,
      high: 1920,
      '1080': 1920,
    }
    return widths[resolution] || 1280
  }

  /**
   * Helper: Get height for resolution preset
   */
  private getResolutionHeight(resolution: string): number {
    const heights: Record<string, number> = {
      preview: 288,
      mobile: 360,
      sd: 576,
      hd: 720,
      high: 1080,
      '1080': 1080,
    }
    return heights[resolution] || 720
  }
}
