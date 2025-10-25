/**
 * POST /api/runs/:runId/execute
 * Execute workflow with real-time SSE streaming
 * Streams node status updates to client
 * Phase 2.5: Uses dynamic WorkflowNode execution with real Fal.ai API
 */

import { NextRequest } from "next/server"
import { findRunByUuid, updateRunStatus, RunStatus } from "@/models/run"
import type { WorkflowPlan } from "@/services/ai-planner"
import type { WorkflowNode } from "@/services/workflow-builder"
import { FalT2IAdapter, FalT2VAdapter, FalTTSAdapter } from "@/integrations/ai-adapters/fal"

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

        // Check if we have dynamic workflow nodes
        if (!workflowPlan.workflowNodes || workflowPlan.workflowNodes.length === 0) {
          sendEvent("error", { message: "No workflow nodes found. Please regenerate workflow." })
          controller.close()
          return
        }

        console.log(`[Execute] Starting dynamic workflow with ${workflowPlan.workflowNodes.length} nodes`)

        // MVP: Use test user
        const userUuid = "test-user-001"

        // 2. Send execution start event
        sendEvent("execution_start", {
          runId,
          nodeCount: workflowPlan.workflowNodes.length,
          sceneCount: workflowPlan.scenes.length,
          hasVoiceover: !!workflowPlan.voiceover,
        })

        // 3. Update run status to Running
        await updateRunStatus(runId, RunStatus.Running)

        // 4. Initialize adapters
        const t2iAdapter = new FalT2IAdapter()
        const t2vAdapter = new FalT2VAdapter()
        const ttsAdapter = new FalTTSAdapter()

        // 5. Topologically sort nodes
        const executionOrder = topologicalSort(workflowPlan.workflowNodes)
        console.log(`[Execute] Execution order: ${executionOrder.join(' → ')}`)

        // 6. Execute nodes in order
        const nodeResults = new Map<string, any>()

        for (const nodeId of executionOrder) {
          const node = workflowPlan.workflowNodes.find((n: WorkflowNode) => n.id === nodeId)
          if (!node) {
            throw new Error(`Node not found: ${nodeId}`)
          }

          // Send node start event
          sendEvent("node_start", {
            nodeId: node.id,
            nodeType: node.type,
            sceneIndex: node.metadata?.sceneIndex,
            status: "running",
          })

          try {
            // Resolve inputs (replace {{nodeId.output}} references)
            const resolvedInputs = resolveInputs(node.inputs, nodeResults)

            // Execute node based on type
            let result: any

            switch (node.type) {
              case 't2i':
                result = await t2iAdapter.call({
                  model: node.model,
                  prompt: resolvedInputs.prompt,
                  imageSize: resolvedInputs.imageSize || 'landscape_16_9',
                  numImages: 1
                })
                nodeResults.set(nodeId, { imageUrl: result.imageUrl })

                sendEvent("node_complete", {
                  nodeId: node.id,
                  nodeType: node.type,
                  sceneIndex: node.metadata?.sceneIndex,
                  status: "completed",
                  artifactUrl: result.imageUrl,
                  thumbnailUrl: result.imageUrl,
                })
                break

              case 'i2v':
              case 't2v':
                result = await t2vAdapter.call({
                  model: node.model,
                  prompt: resolvedInputs.prompt,
                  imageUrl: resolvedInputs.imageUrl, // undefined for T2V
                  duration: resolvedInputs.duration || 5,
                  aspectRatio: '9:16'
                })

                const outputs: any = { videoUrl: result.videoUrl }
                if (result.audioUrl) {
                  outputs.audioUrl = result.audioUrl
                }
                nodeResults.set(nodeId, outputs)

                sendEvent("node_complete", {
                  nodeId: node.id,
                  nodeType: node.type,
                  sceneIndex: node.metadata?.sceneIndex,
                  status: "completed",
                  artifactUrl: result.videoUrl,
                  thumbnailUrl: result.videoUrl,
                })
                break

              case 'tts':
                result = await ttsAdapter.call({
                  model: node.model,
                  text: resolvedInputs.text,
                  voice: resolvedInputs.voice || 'default'
                })
                nodeResults.set(nodeId, { audioUrl: result.audioUrl })

                sendEvent("node_complete", {
                  nodeId: node.id,
                  nodeType: node.type,
                  status: "completed",
                  artifactUrl: result.audioUrl,
                })
                break

              case 'merge':
                // MVP: Return first video as final output
                const videos = resolvedInputs.videos as string[]
                const finalVideoUrl = videos[0]

                console.log(`[Merge] MVP: Using first video as final output`)
                console.log(`[Merge] Videos to merge: ${videos.length}`)

                nodeResults.set(nodeId, { finalVideoUrl })

                sendEvent("node_complete", {
                  nodeId: node.id,
                  nodeType: node.type,
                  status: "completed",
                  artifactUrl: finalVideoUrl,
                })
                break

              default:
                throw new Error(`Unknown node type: ${node.type}`)
            }

          } catch (error: any) {
            console.error(`[Execute] Node ${nodeId} error:`, error)
            sendEvent("node_error", {
              nodeId: node.id,
              status: "failed",
              error: error.message,
            })
            throw error
          }
        }

        // 7. Workflow Complete
        const mergeResult = nodeResults.get('merge')
        const finalVideoUrl = mergeResult?.finalVideoUrl || 'No video generated'

        await updateRunStatus(runId, RunStatus.Completed)

        sendEvent("workflow_complete", {
          runId,
          status: "completed",
          finalVideoUrl,
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

// ============ Helper Functions ============

/**
 * Topological sort using DFS
 */
function topologicalSort(nodes: WorkflowNode[]): string[] {
  const visited = new Set<string>()
  const tempMarked = new Set<string>()
  const order: string[] = []

  const visit = (nodeId: string) => {
    if (tempMarked.has(nodeId)) {
      throw new Error(`Circular dependency detected: ${nodeId}`)
    }
    if (visited.has(nodeId)) {
      return
    }

    tempMarked.add(nodeId)

    const node = nodes.find((n) => n.id === nodeId)
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`)
    }

    // Visit dependencies first
    for (const depId of node.dependencies) {
      visit(depId)
    }

    tempMarked.delete(nodeId)
    visited.add(nodeId)
    order.push(nodeId)
  }

  // Start DFS from all nodes
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      visit(node.id)
    }
  }

  return order
}

/**
 * Resolve input references like {{nodeId.outputKey}}
 * Supports fallback syntax: {{i2v-0.videoUrl || t2v-0.videoUrl}}
 */
function resolveInputs(
  inputs: Record<string, any>,
  results: Map<string, any>
): Record<string, any> {
  const resolved: Record<string, any> = {}

  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'string' && value.includes('{{')) {
      // Extract references
      const match = value.match(/\{\{(.+?)\}\}/)
      if (match) {
        const expression = match[1].trim()

        // Handle fallback syntax
        if (expression.includes('||')) {
          const options = expression.split('||').map((s) => s.trim())

          for (const option of options) {
            const [nodeId, outputKey] = option.split('.')
            const result = results.get(nodeId)

            if (result && result[outputKey]) {
              resolved[key] = result[outputKey]
              break
            }
          }

          if (!resolved[key]) {
            throw new Error(`Could not resolve any fallback for: ${expression}`)
          }
        } else {
          // Simple reference
          const [nodeId, outputKey] = expression.split('.')
          const result = results.get(nodeId)

          if (!result || !result[outputKey]) {
            throw new Error(`Reference not found: ${expression}`)
          }

          resolved[key] = result[outputKey]
        }
      } else {
        resolved[key] = value
      }
    } else if (Array.isArray(value)) {
      // Handle array inputs (e.g., merge node videos)
      resolved[key] = value.map((item) =>
        typeof item === 'string' && item.includes('{{')
          ? resolveInputs({ temp: item }, results).temp
          : item
      )
    } else {
      resolved[key] = value
    }
  }

  return resolved
}
