/**
 * Simple Orchestrator Service
 * Executes AI-generated workflows step by step
 */

import { getFalAdapters } from "@/integrations/ai-adapters"
import type { WorkflowPlan, Scene } from "./ai-planner"
import {
  createRun,
  updateRunStatus,
  updateRunCredits,
  findRunByUuid,
  RunStatus,
} from "@/models/run"
import { createJob, updateJobCompletion, JobStatus } from "@/models/job"
import { createArtifact, ArtifactType } from "@/models/artifact"
import { decreaseCredits, CreditsTransType } from "./credit"
import { getUuid } from "@/lib/hash"
import { getCreditBalance } from "@/models/credit"
import { calculateT2ICost, calculateT2VCost, calculateTTSCost, calculateMergeCost } from "./pricing"
import { sanitizeJson } from "@/lib/sanitize"

export interface OrchestrationResult {
  runUuid: string
  status: RunStatus
  finalVideoUrl?: string
  error?: string
}

export class SimpleOrchestrator {
  private adapters = getFalAdapters()

  /**
   * Execute a complete workflow
   */
  async execute(
    workflowPlan: WorkflowPlan,
    userUuid: string
  ): Promise<OrchestrationResult> {
    const runUuid = getUuid()

    try {
      // Step 0: Check credit balance
      const balance = await getCreditBalance(userUuid)
      if (balance < workflowPlan.estimatedCredits) {
        throw new Error(
          `Insufficient credits. Required: ${workflowPlan.estimatedCredits}, Available: ${balance}`
        )
      }

      // Step 1: Create run record
      await createRun({
        uuid: runUuid,
        user_uuid: userUuid,
        graph_uuid: "",
        graph_snapshot: workflowPlan,
      })

      // Set status to Running and record started_at timestamp
      await updateRunStatus(runUuid, RunStatus.Running)

      // Step 2: Generate all scene images (parallel)
      console.log(`[Orchestrator] Generating ${workflowPlan.scenes.length} images...`)
      const imageJobs = await Promise.all(
        workflowPlan.scenes.map((scene) =>
          this.generateSceneImage(scene, runUuid, userUuid, workflowPlan)
        )
      )

      // Step 3: Generate all scene videos (parallel)
      console.log(`[Orchestrator] Generating ${imageJobs.length} videos...`)
      const videoJobs = await Promise.all(
        imageJobs.map((imageJob, index) =>
          this.generateSceneVideo(
            imageJob.imageUrl,
            workflowPlan.scenes[index],
            runUuid,
            userUuid,
            workflowPlan
          )
        )
      )

      // Step 4: Generate voiceover (if needed)
      let audioUrl: string | null = null
      if (workflowPlan.voiceover) {
        console.log("[Orchestrator] Generating voiceover...")
        audioUrl = await this.generateVoiceover(
          workflowPlan.voiceover,
          runUuid,
          userUuid
        )
      }

      // Step 5: Merge videos using Shotstack API
      console.log("[Orchestrator] Merging final video...")
      const finalVideoUrl = await this.mergeVideos(
        videoJobs.map((job) => job.videoUrl),
        audioUrl,
        runUuid,
        userUuid
      )

      // Step 6: Update run status
      await updateRunStatus(runUuid, RunStatus.Completed, null)

      // Step 7: Create final artifact
      await createArtifact({
        uuid: getUuid(),
        user_uuid: userUuid,
        run_uuid: runUuid,
        job_uuid: "",
        artifact_type: ArtifactType.Video,
        file_url: finalVideoUrl,
        metadata: {
          duration: workflowPlan.scenes.reduce((sum, s) => sum + s.duration, 0),
          scenes: workflowPlan.scenes.length,
        },
      })

      return {
        runUuid,
        status: RunStatus.Completed,
        finalVideoUrl,
      }
    } catch (error: any) {
      console.error("[Orchestrator] Error:", error)
      await updateRunStatus(runUuid, RunStatus.Failed, error.message)

      return {
        runUuid,
        status: RunStatus.Failed,
        error: error.message,
      }
    }
  }

  /**
   * Generate image for a scene
   */
  private async generateSceneImage(
    scene: Scene,
    runUuid: string,
    userUuid: string,
    workflow: WorkflowPlan
  ): Promise<{ imageUrl: string; jobUuid: string }> {
    const jobUuid = getUuid()

    try {
      // Create job record
      await createJob({
        uuid: jobUuid,
        run_uuid: runUuid,
        node_id: scene.id,
        node_type: "T2I",
        adapter: "fal",
        input_params: sanitizeJson({
          prompt: scene.description,
          model: workflow.recommendedModels.t2i,
          imageSize: this.getImageSize(workflow),
          stylePreset: scene.stylePreset,
        }, { removeUndefined: true }),
      })

      // Call T2I adapter
      const result = await this.adapters.t2i.call({
        model: workflow.recommendedModels.t2i,
        prompt: scene.description,
        imageSize: this.getImageSize(workflow),
        stylePreset: scene.stylePreset,
      })

      // Deduct credits using pricing module (T2I costs ~0.25 credits per image)
      const creditsUsed = calculateT2ICost(workflow.recommendedModels.t2i)
      await decreaseCredits({
        user_uuid: userUuid,
        trans_type: CreditsTransType.ImageGeneration,
        credits: creditsUsed,
      })

      // Update job as completed
      await updateJobCompletion(jobUuid, {
        status: JobStatus.Completed,
        output_artifact_uuid: null,
        credits_used: creditsUsed,
        cache_hit: false,
        provider_metadata: sanitizeJson(result.metadata || {}, { removeUndefined: true }),
        error_message: null,
      })

      // Create artifact
      await createArtifact({
        uuid: getUuid(),
        user_uuid: userUuid,
        run_uuid: runUuid,
        job_uuid: jobUuid,
        artifact_type: ArtifactType.Image,
        file_url: result.imageUrl,
        metadata: {
          width: result.width,
          height: result.height,
        },
      })

      return { imageUrl: result.imageUrl, jobUuid }
    } catch (error: any) {
      await updateJobCompletion(jobUuid, {
        status: JobStatus.Failed,
        output_artifact_uuid: null,
        credits_used: 0,
        cache_hit: false,
        provider_metadata: null,
        error_message: error.message,
      })
      throw error
    }
  }

  /**
   * Generate video from image
   */
  private async generateSceneVideo(
    imageUrl: string,
    scene: Scene,
    runUuid: string,
    userUuid: string,
    workflow: WorkflowPlan
  ): Promise<{ videoUrl: string; jobUuid: string }> {
    const jobUuid = getUuid()

    try {
      await createJob({
        uuid: jobUuid,
        run_uuid: runUuid,
        node_id: scene.id,
        node_type: "I2V",
        adapter: "fal",
        input_params: sanitizeJson({
          imageUrl,
          prompt: scene.description,
          duration: scene.duration,
        }, { removeUndefined: true }),
      })

      const dims = this.getVideoDimensions(workflow)
      const result = await this.adapters.t2v.call({
        model: workflow.recommendedModels.t2v,
        imageUrl,
        prompt: scene.description,
        duration: scene.duration,
        width: dims.width,
        height: dims.height,
      })

      // Deduct credits using pricing module (T2V costs ~0.8 credits per second)
      const creditsUsed = calculateT2VCost(workflow.recommendedModels.t2v, scene.duration)
      await decreaseCredits({
        user_uuid: userUuid,
        trans_type: CreditsTransType.VideoGeneration,
        credits: creditsUsed,
      })

      await updateJobCompletion(jobUuid, {
        status: JobStatus.Completed,
        output_artifact_uuid: null,
        credits_used: creditsUsed,
        cache_hit: false,
        provider_metadata: sanitizeJson(result.metadata || {}, { removeUndefined: true }),
        error_message: null,
      })

      await createArtifact({
        uuid: getUuid(),
        user_uuid: userUuid,
        run_uuid: runUuid,
        job_uuid: jobUuid,
        artifact_type: ArtifactType.Video,
        file_url: result.videoUrl,
        metadata: {
          duration: result.duration,
          width: result.width,
          height: result.height,
        },
      })

      return { videoUrl: result.videoUrl, jobUuid }
    } catch (error: any) {
      await updateJobCompletion(jobUuid, {
        status: JobStatus.Failed,
        output_artifact_uuid: null,
        credits_used: 0,
        cache_hit: false,
        provider_metadata: null,
        error_message: error.message,
      })
      throw error
    }
  }

  /**
   * Generate voiceover audio
   */
  private async generateVoiceover(
    voiceoverPlan: any,
    runUuid: string,
    userUuid: string
  ): Promise<string> {
    const jobUuid = getUuid()

    try {
      await createJob({
        uuid: jobUuid,
        run_uuid: runUuid,
        node_id: "voiceover",
        node_type: "TTS",
        adapter: "fal",
        input_params: sanitizeJson({
          script: voiceoverPlan.script,
          voice: voiceoverPlan.voice,
          language: voiceoverPlan.language,
          estimatedDuration: voiceoverPlan.estimatedDuration,
        }, { removeUndefined: true }),
      })

      const result = await this.adapters.tts.call({
        model: "fal-ai/vibevoice",
        text: voiceoverPlan.script,
        voice: voiceoverPlan.voice === "male" ? "male" : "female",
        language: voiceoverPlan.language,
      })

      // Deduct credits using pricing module (TTS costs ~0.5 credits per generation)
      const creditsUsed = calculateTTSCost("elevenlabs/turbo-v2")
      await decreaseCredits({
        user_uuid: userUuid,
        trans_type: CreditsTransType.VideoGeneration,
        credits: creditsUsed,
      })

      await updateJobCompletion(jobUuid, {
        status: JobStatus.Completed,
        output_artifact_uuid: null,
        credits_used: creditsUsed,
        cache_hit: false,
        provider_metadata: sanitizeJson(result.metadata || {}, { removeUndefined: true }),
        error_message: null,
      })

      await createArtifact({
        uuid: getUuid(),
        user_uuid: userUuid,
        run_uuid: runUuid,
        job_uuid: jobUuid,
        artifact_type: ArtifactType.Audio,
        file_url: result.audioUrl,
        metadata: { duration: result.duration },
      })

      return result.audioUrl
    } catch (error: any) {
      await updateJobCompletion(jobUuid, {
        status: JobStatus.Failed,
        output_artifact_uuid: null,
        credits_used: 0,
        cache_hit: false,
        provider_metadata: null,
        error_message: error.message,
      })
      throw error
    }
  }

  /**
   * Merge videos using Shotstack API
   */
  private async mergeVideos(
    videoUrls: string[],
    audioUrl: string | null,
    runUuid: string,
    userUuid: string
  ): Promise<string> {
    const jobUuid = getUuid()

    try {
      await createJob({
        uuid: jobUuid,
        run_uuid: runUuid,
        node_id: "merge",
        node_type: "MERGE",
        adapter: "shotstack",
        input_params: sanitizeJson({ videoUrls, audioUrl }, { removeUndefined: true }),
      })

      // Call Shotstack API (to be implemented)
      const finalVideoUrl = await this.callShotstackAPI(videoUrls, audioUrl)

      // Deduct credits using pricing module (Merge costs ~0.5 credits)
      const creditsUsed = calculateMergeCost()
      await decreaseCredits({
        user_uuid: userUuid,
        trans_type: CreditsTransType.VideoGeneration,
        credits: creditsUsed,
      })

      await updateJobCompletion(jobUuid, {
        status: JobStatus.Completed,
        output_artifact_uuid: null,
        credits_used: creditsUsed,
        cache_hit: false,
        provider_metadata: null,
        error_message: null,
      })

      return finalVideoUrl
    } catch (error: any) {
      await updateJobCompletion(jobUuid, {
        status: JobStatus.Failed,
        output_artifact_uuid: null,
        credits_used: 0,
        cache_hit: false,
        provider_metadata: null,
        error_message: error.message,
      })
      throw error
    }
  }

  /**
   * Call Shotstack API to merge videos
   */
  private async callShotstackAPI(
    videoUrls: string[],
    audioUrl: string | null
  ): Promise<string> {
    const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY
    const SHOTSTACK_STAGE = process.env.SHOTSTACK_STAGE || "stage" // "stage" or "v1"

    if (!SHOTSTACK_API_KEY) {
      throw new Error("SHOTSTACK_API_KEY is not configured")
    }

    // Build timeline with video clips
    const clips = videoUrls.map((url) => ({
      asset: {
        type: "video",
        src: url,
      },
      start: 0,
      length: "auto",
    }))

    // Add audio track if available
    const soundtrack = audioUrl
      ? {
          src: audioUrl,
          effect: "fadeInFadeOut",
        }
      : undefined

    const payload = {
      timeline: {
        soundtrack,
        tracks: [
          {
            clips,
          },
        ],
      },
      output: {
        format: "mp4",
        resolution: "hd",
      },
    }

    // Step 1: Submit render job
    const renderResponse = await fetch(
      `https://api.shotstack.io/${SHOTSTACK_STAGE}/render`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SHOTSTACK_API_KEY,
        },
        body: JSON.stringify(payload),
      }
    )

    if (!renderResponse.ok) {
      const error = await renderResponse.text()
      throw new Error(`Shotstack render failed: ${error}`)
    }

    const renderData = await renderResponse.json()
    const renderId = renderData.response.id

    // Step 2: Poll for completion (max 60 seconds)
    let attempts = 0
    const maxAttempts = 30

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait 2 seconds

      const statusResponse = await fetch(
        `https://api.shotstack.io/${SHOTSTACK_STAGE}/render/${renderId}`,
        {
          headers: {
            "x-api-key": SHOTSTACK_API_KEY,
          },
        }
      )

      const statusData = await statusResponse.json()
      const status = statusData.response.status

      if (status === "done") {
        return statusData.response.url
      }

      if (status === "failed") {
        throw new Error("Shotstack render failed")
      }

      attempts++
    }

    throw new Error("Shotstack render timeout")
  }

  /**
   * Get image size based on aspect ratio
   */
  private getImageSize(workflow: WorkflowPlan): string {
    const ar = (workflow as any).aspectRatio || "16:9"
    switch (ar) {
      case "9:16":
        return "portrait_9_16"
      case "1:1":
        return "square"
      case "16:9":
      default:
        return "landscape_16_9"
    }
  }

  /**
   * Get target video dimensions based on aspect ratio
   */
  private getVideoDimensions(workflow: WorkflowPlan): { width: number; height: number } {
    const ar = (workflow as any).aspectRatio || "16:9"
    switch (ar) {
      case "9:16":
        return { width: 1080, height: 1920 }
      case "1:1":
        return { width: 1080, height: 1080 }
      case "16:9":
      default:
        return { width: 1920, height: 1080 }
    }
  }
}

/**
 * Helper function to create orchestrator instance
 */
export function createOrchestrator() {
  return new SimpleOrchestrator()
}
