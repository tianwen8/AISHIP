/**
 * POST /api/runs/[runId]/execute
 * Execute workflow for a run
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/config"
import { findRunByUuid } from "@/models/run"
import { SimpleOrchestrator } from "@/services/orchestrator"

export async function POST(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userUuid = session.user.id || session.user.email
    const runId = params.runId

    // 2. Find run
    const run = await findRunByUuid(runId)
    if (!run) {
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      )
    }

    // 3. Verify ownership
    if (run.user_uuid !== userUuid) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // 4. Execute workflow
    const orchestrator = new SimpleOrchestrator()
    const result = await orchestrator.execute(run.workflow_plan, userUuid)

    // 5. Return result
    return NextResponse.json({
      runUuid: result.runUuid,
      status: result.status,
      finalVideoUrl: result.finalVideoUrl,
    })
  } catch (error: any) {
    console.error("Execute API error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to execute workflow" },
      { status: 500 }
    )
  }
}
