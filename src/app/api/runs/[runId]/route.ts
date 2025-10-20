/**
 * GET /api/runs/:runId
 * Get run status and progress (for polling)
 *
 * PRODUCTION VERSION: Uses real database
 */

import { NextResponse } from "next/server"
import { findRunByUuid } from "@/models/run"

export async function GET(
  req: Request,
  context: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await context.params

    // Find run in database
    const run = await findRunByUuid(runId)
    if (!run) {
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      )
    }

    // Return run data with workflow plan from graph_snapshot
    return NextResponse.json({
      run_uuid: run.uuid,
      status: run.status,
      workflow_plan: run.graph_snapshot, // WorkflowPlan stored as JSONB
      estimated_credits: 0, // TODO: Calculate from graph_snapshot
      used_credits: run.total_credits_deducted / 10, // Convert micro-units to credits
      created_at: run.created_at,
      started_at: run.started_at,
      completed_at: run.completed_at,
      error_message: run.error_message,
    })
  } catch (error: any) {
    console.error("Get run error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to get run status" },
      { status: 500 }
    )
  }
}
