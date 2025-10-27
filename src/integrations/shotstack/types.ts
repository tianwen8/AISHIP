/**
 * Shotstack API Types
 * https://shotstack.io/docs/api/
 */

export interface ShotstackVideoClip {
  url: string
  duration: number
  hasAudio?: boolean
}

export interface ShotstackMergeRequest {
  videos: ShotstackVideoClip[]
  audioUrl?: string // Optional TTS voiceover track
  transitions?: {
    type: 'fade' | 'wipe' | 'slideLeft' | 'slideRight'
    duration: number // seconds
  }
  output?: {
    format: 'mp4' | 'gif'
    resolution: 'preview' | 'mobile' | 'sd' | 'hd' | 'high' | '1080'
    fps?: number
    quality?: 'low' | 'medium' | 'high'
  }
}

export interface ShotstackMergeResponse {
  finalVideoUrl: string
  duration: number
  width: number
  height: number
  metadata: {
    renderId: string
    renderTime: number // milliseconds
    clipCount: number
  }
}

// Shotstack API Response Types
export interface ShotstackRenderResponse {
  success: boolean
  message: string
  response: {
    id: string
    message: string
  }
}

export interface ShotstackStatusResponse {
  success: boolean
  message: string
  response: {
    id: string
    owner: string
    plan: string
    status: 'queued' | 'fetching' | 'rendering' | 'saving' | 'done' | 'failed'
    error?: string
    duration: number
    renderTime?: number
    url?: string
    poster?: string
    thumbnail?: string
    data: {
      timeline: any
      output: any
    }
    created: string
    updated: string
  }
}
