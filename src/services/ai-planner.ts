/**
 * AI Planner Service
 * Intelligently generates workflow plans based on user input
 */

import { getFalAdapters, DEFAULT_MODELS } from "@/integrations/ai-adapters"
import { DeepSeekLLMAdapter } from "@/integrations/ai-adapters/deepseek"
import { estimateWorkflowCost } from "./pricing"

// ============ Type Definitions ============

export interface UserInput {
  prompt: string // User's video description
  duration: number // Video length in seconds (8, 15, or 30)
  aspectRatio: string // "9:16", "16:9", or "1:1"
  voice?: string // "none", "male", "female", "clone"
  referenceImage?: string // URL or null
  style?: string // "photorealistic", "anime", "cartoon", etc.
}

export interface Scene {
  id: string
  duration: number
  description: string // Detailed prompt for T2I
  cameraAngle?: string // "close-up", "mid-shot", "wide", etc.
  movement?: string // "static", "pan-left", "zoom-in", etc.
  stylePreset?: string
}

export interface VoiceoverPlan {
  script: string
  voice: string
  language: string
  estimatedDuration: number
}

export interface WorkflowPlan {
  scenes: Scene[]
  voiceover?: VoiceoverPlan
  music?: {
    mood: string
    genre: string
  }
  aspectRatio: string
  recommendedModels: {
    llm: string
    t2i: string
    t2v: string
    tts?: string
  }
  estimatedCredits: number
}

// ============ AI Planner Implementation ============

export class AIPlanner {
  private adapters = getFalAdapters()
  private deepseekLLM = new DeepSeekLLMAdapter()

  /**
   * Generate a complete workflow plan from user input
   */
  async generateWorkflow(input: UserInput): Promise<WorkflowPlan> {
    try {
      // Step 1: Use LLM to analyze and create structured plan
      const plannerPrompt = this.buildPlannerPrompt(input)

      // Use DeepSeek for LLM (not Fal.ai)
      const llmResponse = await this.deepseekLLM.call({
        model: DEFAULT_MODELS.llm,
        prompt: plannerPrompt.userPrompt,
        systemPrompt: plannerPrompt.systemPrompt,
        temperature: 0.7,
        maxTokens: 2000,
        responseFormat: "json",
      })

      const planData = JSON.parse(llmResponse.output)

      // Step 2: Build workflow plan
      const workflow: WorkflowPlan = {
        scenes: planData.scenes.map((scene: any, index: number) => ({
          id: `scene_${index + 1}`,
          duration: scene.duration,
          description: scene.description,
          cameraAngle: scene.cameraAngle || "mid-shot",
          movement: scene.movement || "static",
          stylePreset: input.style || "photorealistic",
        })),
        aspectRatio: input.aspectRatio,
        recommendedModels: {
          llm: DEFAULT_MODELS.llm,
          t2i: this.selectBestT2IModel(input),
          t2v: this.selectBestT2VModel(input),
        },
        estimatedCredits: 0,
      }

      // Step 3: Add voiceover plan if requested
      if (input.voice && input.voice !== "none") {
        workflow.voiceover = {
          script: planData.voiceoverScript || "",
          voice: input.voice,
          language: "en",
          estimatedDuration: input.duration,
        }
        workflow.recommendedModels.tts = DEFAULT_MODELS.tts
      }

      // Step 4: Add music suggestion if available
      if (planData.music) {
        workflow.music = planData.music
      }

      // Step 5: Calculate estimated credits
      workflow.estimatedCredits = this.calculateEstimatedCredits(workflow)

      return workflow
    } catch (error: any) {
      console.error("AI Planner error:", error)
      throw new Error(`Failed to generate workflow: ${error.message}`)
    }
  }

  /**
   * Build the prompt for the LLM planner
   */
  private buildPlannerPrompt(input: UserInput) {
    const systemPrompt = `You are an expert video director and storyboard artist. Your task is to analyze a user's video description and create a detailed storyboard with 3-5 scenes.

For each scene, provide:
1. Duration (in seconds) - must sum to exactly ${input.duration} seconds
2. Detailed visual description suitable for AI image generation (be specific about composition, lighting, subject details)
3. Camera angle (close-up, mid-shot, wide, aerial, etc.)
4. Camera movement (static, pan-left, pan-right, zoom-in, zoom-out, following, etc.)

${input.voice && input.voice !== "none" ? `Also create a compelling voiceover script that matches the ${input.duration}-second duration and enhances the visual story.` : ""}

Output must be valid JSON with this exact structure:
{
  "scenes": [
    {
      "duration": 5,
      "description": "Detailed visual description for image generation",
      "cameraAngle": "close-up",
      "movement": "static"
    }
  ],
  "voiceoverScript": "Script text here (if voice requested)",
  "music": {
    "mood": "upbeat/dramatic/calm/etc",
    "genre": "electronic/orchestral/acoustic/etc"
  }
}`

    const userPrompt = `Create a ${input.duration}-second video storyboard for:

"${input.prompt}"

Video Specifications:
- Duration: ${input.duration} seconds
- Aspect Ratio: ${input.aspectRatio}
- Style: ${input.style || "photorealistic"}
${input.voice && input.voice !== "none" ? `- Voiceover: ${input.voice} voice` : "- No voiceover"}
${input.referenceImage ? `- Reference image provided (use for visual style inspiration)` : ""}

Important:
- Scene durations MUST sum to exactly ${input.duration} seconds
- Each scene description should be detailed enough for AI image generation
- Consider visual variety (different angles, compositions)
- Ensure smooth narrative flow between scenes
${input.voice && input.voice !== "none" ? `- Voiceover script should be engaging and match the pacing` : ""}

Output as valid JSON only, no additional text.`

    return { systemPrompt, userPrompt }
  }

  /**
   * Select the best T2I model based on input characteristics
   */
  private selectBestT2IModel(input: UserInput): string {
    // For cartoon/anime styles, use NanoBanana
    if (input.style === "cartoon" || input.style === "anime") {
      return "fal-ai/nanobanana"
    }

    // Default to FLUX-dev for best quality/cost balance
    return DEFAULT_MODELS.t2i
  }

  /**
   * Select the best T2V model based on input characteristics
   */
  private selectBestT2VModel(input: UserInput): string {
    // For longer videos, use more cost-effective model
    if (input.duration >= 30) {
      return "fal-ai/kling-v1"
    }

    // Default to Kling-v1 for good quality/cost balance
    return DEFAULT_MODELS.t2v
  }

  /**
   * Calculate estimated credits for the workflow
   * Uses shared pricing module to ensure estimate = deduction parity
   */
  private calculateEstimatedCredits(workflow: WorkflowPlan): number {
    const totalDuration = workflow.scenes.reduce((sum, s) => sum + s.duration, 0)

    const estimate = estimateWorkflowCost({
      sceneCount: workflow.scenes.length,
      totalDurationSeconds: totalDuration,
      hasVoiceover: !!workflow.voiceover,
      t2iModel: workflow.recommendedModels.t2i,
      t2vModel: workflow.recommendedModels.t2v,
      ttsModel: workflow.recommendedModels.tts,
    })

    // Round up to nearest 0.5 for user-facing display
    return Math.ceil(estimate * 2) / 2
  }
}

/**
 * Helper function to create AI Planner instance
 */
export function createAIPlanner() {
  return new AIPlanner()
}
