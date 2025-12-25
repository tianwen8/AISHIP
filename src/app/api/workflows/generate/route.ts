/**
 * POST /api/workflows/generate
 * Generate a complete video workflow from user input
 */

import { getUserUuid } from "@/services/user-session"
import { respData, respErr } from "@/lib/resp"
import { createAIPlanner } from "@/services/ai-planner"
import { createOrchestrator } from "@/services/orchestrator"

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const userUuid = await getUserUuid()
    if (!userUuid) {
      return respErr("Authentication required. Please sign in.")
    }

    // Parse request body
    const { prompt, duration, aspectRatio, voice, referenceImage, style } =
      await req.json()

    // Validate input
    if (!prompt || !duration || !aspectRatio) {
      return respErr("Missing required fields: prompt, duration, aspectRatio")
    }

    if (![8, 15, 30].includes(duration)) {
      return respErr("Duration must be 8, 15, or 30 seconds")
    }

    if (!["9:16", "16:9", "1:1"].includes(aspectRatio)) {
      return respErr("Aspect ratio must be 9:16, 16:9, or 1:1")
    }

    // Step 1: Use AI Planner to generate workflow
    const planner = createAIPlanner()
    const workflowPlan = await planner.generateWorkflow({
      prompt,
      duration,
      aspectRatio,
      voice: voice || "none",
      referenceImage: referenceImage || undefined,
      style: style || "photorealistic",
    })

    // Step 2: Execute workflow with Orchestrator
    const orchestrator = createOrchestrator()
    const result = await orchestrator.execute(workflowPlan, userUuid)

    return respData({
      runUuid: result.runUuid,
      status: result.status,
      finalVideoUrl: result.finalVideoUrl,
      workflowPlan,
    })
  } catch (error: any) {
    console.error("Workflow generation error:", error)
    return respErr(`Failed to generate video: ${error.message}`)
  }
}
