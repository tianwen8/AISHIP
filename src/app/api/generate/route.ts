/**
 * POST /api/generate
 * Generate AI workflow from user input
 *
 * PRODUCTION VERSION: Uses real AIPlanner and database
 */

import { NextRequest, NextResponse } from "next/server"
import { AIPlanner } from "@/services/ai-planner"
import { RunStatus, createRun } from "@/models/run"
import { createGraph } from "@/models/graph"
import { getUuid } from "@/lib/hash"

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body
    const body = await req.json()
    const { prompt, duration, platform, voice } = body

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    // MVP: Use a test user UUID (skip authentication for now)
    // TODO: Replace with real authentication in production
    const userUuid = "test-user-001"

    // 2. Check credit balance (skip for MVP testing)
    // const balance = await getCreditBalance(userUuid)
    // if (balance < estimatedCost) {
    //   return NextResponse.json({ error: "Insufficient credits" }, { status: 402 })
    // }

    // 3. Generate workflow using real AI Planner
    const planner = new AIPlanner()
    const workflowPlan = await planner.generateWorkflow({
      prompt: prompt.trim(),
      duration: duration || 15,
      aspectRatio: "9:16", // Default for vertical video
      voice: voice || "none",
      referenceImage: undefined,
      style: undefined,
    })

    // 4. Create Graph (save the AI-generated workflow as a project)
    const graphUuid = getUuid()
    await createGraph({
      uuid: graphUuid,
      user_uuid: userUuid,
      name: `${prompt.substring(0, 50)}...`, // Use first 50 chars of prompt as name
      description: `Platform: ${platform || "TikTok"}, Duration: ${duration || 15}s, Voice: ${voice || "none"}`,
      graph_definition: workflowPlan,
    })

    // 5. Create Run (execution record)
    const runUuid = getUuid()
    await createRun({
      uuid: runUuid,
      user_uuid: userUuid,
      graph_uuid: graphUuid,
      graph_snapshot: workflowPlan, // Freeze workflow at run time
    })

    // 6. Return runUuid to redirect to canvas
    return NextResponse.json({
      runUuid,
      estimatedCredits: workflowPlan.estimatedCredits,
      sceneCount: workflowPlan.scenes.length,
    })
  } catch (error: any) {
    console.error("Generate API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate workflow" },
      { status: 500 }
    )
  }
}
