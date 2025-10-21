/**
 * POST /api/runs/:runId/execute
 * Execute workflow with real-time SSE streaming
 * Streams node status updates to client
 */

import { NextRequest } from "next/server"
import { findRunByUuid, updateRunStatus, RunStatus } from "@/models/run"
import type { WorkflowPlan } from "@/services/ai-planner"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params

  // Create SSE stream
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Helper to send SSE events
        const sendEvent = (event: string, data: any) => {
          try {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(message))
          } catch (err) {
            console.warn("Failed to send SSE event:", err)
          }
        }

        // 1. Get run data
        const run = await findRunByUuid(runId)
        if (!run) {
          sendEvent("error", { message: "Run not found" })
          controller.close()
          return
        }

        const workflowPlan = run.graph_snapshot as WorkflowPlan
        if (!workflowPlan || !workflowPlan.scenes) {
          sendEvent("error", { message: "Invalid workflow plan" })
          controller.close()
          return
        }

        // MVP: Use test user
        const userUuid = "test-user-001"

        // 2. Send execution start event
        sendEvent("execution_start", {
          runId,
          sceneCount: workflowPlan.scenes.length,
          hasVoiceover: !!workflowPlan.voiceover,
        })

        // 3. Update run status to Running
        await updateRunStatus(runId, RunStatus.Running)

        // 4. Execute each scene with progress updates
        for (let i = 0; i < workflowPlan.scenes.length; i++) {
          const scene = workflowPlan.scenes[i]
          const sceneId = scene.id

          // T2I Node Start
          const t2iNodeId = `t2i-${sceneId}`
          sendEvent("node_start", {
            nodeId: t2iNodeId,
            nodeType: "t2i",
            sceneIndex: i + 1,
            status: "running",
          })

          try {
            // Mock: Generate image (2 seconds)
            await new Promise((resolve) => setTimeout(resolve, 2000))

            // T2I Node Complete
            sendEvent("node_complete", {
              nodeId: t2iNodeId,
              nodeType: "t2i",
              sceneIndex: i + 1,
              status: "completed",
              artifactUrl: "https://via.placeholder.com/1080x1920/FF6B9D/FFFFFF?text=Scene+" + (i + 1),
              thumbnailUrl: "https://via.placeholder.com/200x300/FF6B9D/FFFFFF?text=T2I",
            })

            // I2V Node Start
            const i2vNodeId = `i2v-${sceneId}`
            sendEvent("node_start", {
              nodeId: i2vNodeId,
              nodeType: "i2v",
              sceneIndex: i + 1,
              status: "running",
            })

            // Mock: Generate video (3 seconds)
            await new Promise((resolve) => setTimeout(resolve, 3000))

            // I2V Node Complete
            sendEvent("node_complete", {
              nodeId: i2vNodeId,
              nodeType: "i2v",
              sceneIndex: i + 1,
              status: "completed",
              artifactUrl: "https://via.placeholder.com/1080x1920/4ECDC4/FFFFFF?text=Video+" + (i + 1),
              thumbnailUrl: "https://via.placeholder.com/200x300/4ECDC4/FFFFFF?text=I2V",
            })
          } catch (error: any) {
            sendEvent("node_error", {
              nodeId: t2iNodeId,
              status: "failed",
              error: error.message,
            })
            throw error
          }
        }

        // 5. TTS Node (if voiceover exists)
        if (workflowPlan.voiceover) {
          const ttsNodeId = "tts"
          sendEvent("node_start", {
            nodeId: ttsNodeId,
            nodeType: "tts",
            status: "running",
          })

          await new Promise((resolve) => setTimeout(resolve, 2000))

          sendEvent("node_complete", {
            nodeId: ttsNodeId,
            nodeType: "tts",
            status: "completed",
            artifactUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          })
        }

        // 6. Merge Node
        const mergeNodeId = "merge"
        sendEvent("node_start", {
          nodeId: mergeNodeId,
          nodeType: "merge",
          status: "running",
        })

        await new Promise((resolve) => setTimeout(resolve, 3000))

        sendEvent("node_complete", {
          nodeId: mergeNodeId,
          nodeType: "merge",
          status: "completed",
          artifactUrl: "https://via.placeholder.com/1080x1920/FFE66D/000000?text=Final+Video",
        })

        // 7. Workflow Complete
        await updateRunStatus(runId, RunStatus.Completed)

        sendEvent("workflow_complete", {
          runId,
          status: "completed",
          finalVideoUrl: "https://via.placeholder.com/1080x1920/FFE66D/000000?text=Final+Video",
        })

        controller.close()
      } catch (error: any) {
        console.error("Execution error:", error)
        const message = `event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`
        controller.enqueue(encoder.encode(message))

        // Update run status to failed
        await updateRunStatus(runId, RunStatus.Failed, error.message)

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
