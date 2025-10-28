/**
 * POST /api/test/merge-videos
 * Test endpoint for Shotstack video merging
 */

import { NextRequest, NextResponse } from "next/server";
import { ShotstackAdapter } from "@/integrations/shotstack/adapter";
import type { ShotstackMergeRequest } from "@/integrations/shotstack/types";

export async function POST(req: NextRequest) {
  try {
    const body: ShotstackMergeRequest = await req.json();

    console.log("[Test Merge] Request received:", {
      videoCount: body.videos.length,
      hasAudio: !!body.audioUrl,
      transition: body.transitions?.type || "fade",
    });

    // Validate inputs
    if (!body.videos || body.videos.length === 0) {
      return NextResponse.json(
        { error: "At least one video is required" },
        { status: 400 }
      );
    }

    // Initialize Shotstack adapter
    const shotstackAdapter = new ShotstackAdapter();

    // Merge videos
    const result = await shotstackAdapter.mergeVideos(body);

    console.log("[Test Merge] Success:", result.finalVideoUrl);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Test Merge] Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Video merge failed",
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
