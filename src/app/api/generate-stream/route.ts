/**
 * POST /api/generate-stream
 * Stream workflow generation progress to client
 * Uses Server-Sent Events (SSE) for real-time updates
 */

import { NextRequest } from "next/server"
import { AIPlanner } from "@/services/ai-planner"
import { createGraph } from "@/models/graph"
import { createRun, RunStatus } from "@/models/run"
import { getUuid } from "@/lib/hash"

export async function POST(req: NextRequest) {
  // Create a readable stream for SSE
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Helper function to send SSE events
        const sendEvent = (event: string, data: any) => {
          try {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(message))
          } catch (err) {
            // Controller already closed, ignore
            console.warn("Failed to send SSE event:", err)
          }
        }

        // 1. Parse request body
        const body = await req.json()
        const { prompt, duration, platform, voice } = body

        if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
          sendEvent("error", { message: "Prompt is required" })
          controller.close()
          return
        }

        // 2. Send initial status
        sendEvent("status", { message: "Analyzing your request...", progress: 10 })

        // MVP: Use test user
        const userUuid = "test-user-001"

        // 3. Generate workflow with progress updates
        sendEvent("status", { message: "Planning scenes...", progress: 30 })

        const planner = new AIPlanner()
        const workflowPlan = await planner.generateWorkflow({
          prompt: prompt.trim(),
          duration: duration || 15,
          aspectRatio: "9:16",
          voice: voice || "none",
          referenceImage: undefined,
          style: undefined,
        })

        // 4. Send workflow plan
        sendEvent("status", { message: "Creating workflow...", progress: 60 })
        sendEvent("workflow", { workflowPlan })

        // 5. Create Graph
        sendEvent("status", { message: "Saving project...", progress: 80 })

        const graphUuid = getUuid()
        await createGraph({
          uuid: graphUuid,
          user_uuid: userUuid,
          name: `${prompt.substring(0, 50)}...`,
          description: `Platform: ${platform || "TikTok"}, Duration: ${duration || 15}s, Voice: ${voice || "none"}`,
          graph_definition: workflowPlan,
        })

        // 6. Create Run
        const runUuid = getUuid()
        await createRun({
          uuid: runUuid,
          user_uuid: userUuid,
          graph_uuid: graphUuid,
          graph_snapshot: workflowPlan,
        })

        // 7. Send completion
        sendEvent("status", { message: "Complete!", progress: 100 })
        sendEvent("complete", {
          runUuid,
          graphUuid,
          estimatedCredits: workflowPlan.estimatedCredits,
          sceneCount: workflowPlan.scenes.length,
          workflowPlan, // Include full workflow plan
        })

        controller.close()
      } catch (error: any) {
        console.error("Generate stream error:", error)
        const message = `event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`
        controller.enqueue(encoder.encode(message))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}
