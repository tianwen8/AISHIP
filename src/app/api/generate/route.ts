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
import { getUserUuid } from "@/services/user-session"
import { getUserCredits, decreaseCredits, CreditsTransType } from "@/services/credit"

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

    // 2. Get authenticated user
    const userUuid = await getUserUuid()
    if (!userUuid) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to continue." },
        { status: 401 }
      )
    }

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

    // 3.5. Check credit balance and deduct estimated cost
    const estimatedCost = workflowPlan.estimatedCredits || 0
    const userCreditsData = await getUserCredits(userUuid)
    const currentBalance = userCreditsData.left_credits || 0

    if (currentBalance < estimatedCost) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You have ${currentBalance} credits but need ${estimatedCost} credits. Please purchase more credits.`,
          currentBalance,
          estimatedCost,
        },
        { status: 402 } // Payment Required
      )
    }

    // Deduct estimated credits upfront
    await decreaseCredits({
      user_uuid: userUuid,
      trans_type: CreditsTransType.VideoGeneration,
      credits: estimatedCost,
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
      total_credits_deducted: estimatedCost, // Track deducted credits
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
