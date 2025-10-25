/**
 * POST /api/generate-stream
 * Stream workflow generation progress to client
 * Uses Server-Sent Events (SSE) for real-time updates
 */

import { NextRequest } from "next/server"
import { AIPlanner } from "@/services/ai-planner"
import { createGraph } from "@/models/graph"
import { createRun } from "@/models/run"
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

        // MVP: Use test user
        const userUuid = "test-user-001"

        // 2. Create runUuid immediately and send to client
        const runUuid = getUuid()
        const graphUuid = getUuid()

        sendEvent("init", {
          runUuid,
          graphUuid,
          message: "Workflow generation started"
        })

        // 3. Send initial status
        sendEvent("status", { message: "Analyzing your request...", progress: 10 })

        // 4. Generate workflow with progress updates
        sendEvent("status", { message: "Planning scenes...", progress: 30 })

        // TEMPORARY: Use mock workflow for testing Phase 2.5
        const USE_MOCK = false  // Set to false to use real AI Planner

        let workflowPlan: any;

        if (USE_MOCK) {
          // Mock workflow plan for testing WorkflowBuilder
          const { createWorkflowBuilder } = await import("@/services/workflow-builder")

          const mockScenes = [
            {
              id: "scene_1",
              duration: 5,
              description: "A golden retriever running on the beach, wide shot with sunset lighting, vibrant warm colors",
              cameraAngle: "wide",
              movement: "pan-right"
            },
            {
              id: "scene_2",
              duration: 5,
              description: "Mid-shot of the golden retriever playing in ocean waves, dynamic movement, splash effects",
              cameraAngle: "mid-shot",
              movement: "following"
            },
            {
              id: "scene_3",
              duration: 5,
              description: "Close-up of golden retriever's happy face, sunset bokeh background, shallow depth of field",
              cameraAngle: "close-up",
              movement: "static"
            }
          ]

          const mockVoiceover = voice && voice !== "none" ? {
            script: "Watch this beautiful golden retriever enjoy a perfect sunset at the beach. Pure joy and freedom in every moment.",
            voice: voice,
            language: "en",
            estimatedDuration: duration || 15
          } : undefined

          workflowPlan = {
            scenes: mockScenes,
            voiceover: mockVoiceover,
            aspectRatio: "9:16",
            recommendedModels: {
              llm: "deepseek/deepseek-chat",
              t2i: "fal-ai/flux-dev",
              t2v: "fal-ai/kling-v1",  // Default to Kling V1
              tts: voice && voice !== "none" ? "elevenlabs/turbo-v2" : undefined
            },
            estimatedCredits: 14.5
          }

          // Generate workflow nodes using WorkflowBuilder
          const workflowBuilder = createWorkflowBuilder()
          workflowPlan.workflowNodes = workflowBuilder.buildWorkflow(
            workflowPlan.scenes,
            workflowPlan.voiceover,
            {
              t2i: workflowPlan.recommendedModels.t2i,
              i2v: workflowPlan.recommendedModels.t2v,
              tts: workflowPlan.recommendedModels.tts
            }
          )
        } else {
          // Use real AI Planner
          const planner = new AIPlanner()
          workflowPlan = await planner.generateWorkflow({
            prompt: prompt.trim(),
            duration: duration || 15,
            aspectRatio: "9:16",
            voice: voice || "none",
            referenceImage: undefined,
            style: undefined,
          })
        }

        // 5. Send workflow plan
        sendEvent("status", { message: "Creating workflow...", progress: 60 })

        // Log workflow nodes for debugging (Phase 2.5)
        if (workflowPlan.workflowNodes) {
          console.log("=== Generated Workflow Nodes ===")
          console.log(`Total nodes: ${workflowPlan.workflowNodes.length}`)
          workflowPlan.workflowNodes.forEach((node: any) => {
            console.log(`- ${node.id} (${node.type}): ${node.model}`)
            if (node.dependencies.length > 0) {
              console.log(`  Dependencies: ${node.dependencies.join(', ')}`)
            }
            if (node.metadata) {
              console.log(`  Metadata:`, node.metadata)
            }
          })
          console.log("================================")
        }

        sendEvent("workflow", { workflowPlan })

        // 6. Create Graph
        sendEvent("status", { message: "Saving project...", progress: 80 })

        try {
          await createGraph({
            uuid: graphUuid,
            user_uuid: userUuid,
            name: `${prompt.substring(0, 50)}...`,
            description: `Platform: ${platform || "TikTok"}, Duration: ${duration || 15}s, Voice: ${voice || "none"}`,
            graph_definition: workflowPlan,
          })

          // 7. Create Run
          await createRun({
            uuid: runUuid,
            user_uuid: userUuid,
            graph_uuid: graphUuid,
            graph_snapshot: workflowPlan,
          })
        } catch (dbError: any) {
          console.error("Database error (continuing without save):", dbError.message)
          // Continue execution even if database save fails
          sendEvent("warning", {
            message: "Database temporarily unavailable, workflow will not be saved"
          })
        }

        // 8. Send completion
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
