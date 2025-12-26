import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, tool_runs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTool } from "@/tools/registry";
import { getToolCost } from "@/tools/definitions";
import { nanoid } from "nanoid";
import { getUserCredits } from "@/services/credit";
import { FalT2IAdapter } from "@/integrations/ai-adapters/fal";
import { checkAndBumpUsage } from "@/services/usage";
import { deductPreviewCredits } from "@/services/preview-credit";

export const maxDuration = 60; // Allow 60s for LLM processing

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Request
    const body = await req.json();
    const { toolId, input } = body;

    if (!toolId || !input) {
      return NextResponse.json({ error: "Missing toolId or input" }, { status: 400 });
    }

    // 3. Get Tool Definition
    const tool = getTool(toolId);
    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    // 4. Validate Input
    const parseResult = tool.inputSchema.safeParse(input);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.format() },
        { status: 400 }
      );
    }
    const safeInput = parseResult.data;

    // 5. Check User Balance & Get User ID
    // We need the user's DB ID/UUID, not just email from session
    const userRecord = await db()
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userRecord[0];
    const userCredits = await getUserCredits(user.uuid);
    const wantsPreview = !!safeInput.withPreviewImage;
    const previewBalance = userCredits.preview_credits || 0;
    const { totalCost, previewAllowed } = getToolCost(tool.meta, {
      withPreviewImage: wantsPreview,
      planTier: userCredits.plan_tier || "free",
    });

    if (!previewAllowed) {
      return NextResponse.json(
        { error: "Preview images are available on Pro only." },
        { status: 403 }
      );
    }

    if (wantsPreview && previewBalance < totalCost) {
      return NextResponse.json(
        { error: "No preview credits remaining", required: totalCost, current: previewBalance },
        { status: 402 } // Payment Required
      );
    }

    const usageCheck = await checkAndBumpUsage({
      user_uuid: user.uuid,
      plan_tier: userCredits.plan_tier || "free",
    });
    if (!usageCheck.allowed) {
      const message =
        usageCheck.reason === "daily_limit"
          ? "Daily generation limit reached. Upgrade to Pro for higher limits."
          : "Too many requests. Please wait a minute and try again.";
      return NextResponse.json(
        { error: message, limits: usageCheck.limits },
        { status: 429 }
      );
    }

    // 6. Run Tool (The expensive AI part)
    // We run it BEFORE deducting to avoid charging for failures
    let output;
    try {
      output = await tool.run(safeInput);
    } catch (toolError: any) {
      console.error("Tool execution failed:", toolError);
      return NextResponse.json(
        { error: "Generation failed", message: toolError.message },
        { status: 500 }
      );
    }

    // 7. Transaction: Deduct Credits & Save Run
    const runUuid = nanoid();
    let previewImageUrl: string | undefined = undefined;
    let remainingPreviewCredits = previewBalance;

    if (wantsPreview) {
      const t2i = new FalT2IAdapter();
      const previewPrompt =
        output?.shots?.[0]?.prompt_en || output?.master_prompt || safeInput.prompt;
      const previewResult = await t2i.call({
        model: "fal-ai/flux/dev",
        prompt: previewPrompt,
        imageSize: "landscape_16_9",
        numImages: 1,
      });
      previewImageUrl = previewResult.imageUrl;
      output = {
        ...output,
        preview_image_url: previewImageUrl,
      };
    }
    
    if (wantsPreview) {
      const deduction = await deductPreviewCredits({
        user_uuid: user.uuid,
        cost: totalCost,
      });
      if (!deduction.success) {
        return NextResponse.json(
          { error: "No preview credits remaining", required: totalCost, current: previewBalance },
          { status: 402 }
        );
      }
      remainingPreviewCredits = deduction.balance;
    }

    await db().insert(tool_runs).values({
      uuid: runUuid,
      user_uuid: user.uuid,
      tool_id: tool.meta.id,
      status: "completed",
      cost_credits: wantsPreview ? totalCost : 0,
      input_json: JSON.stringify(safeInput),
      output_json: JSON.stringify(output),
      usage_json: JSON.stringify({
        model: "deepseek-chat",
        preview_image: wantsPreview,
        plan_tier: userCredits.plan_tier || "free",
      }),
      created_at: new Date(),
      completed_at: new Date(),
    });

    // 8. Return Success
    return NextResponse.json({
      success: true,
      data: output,
      credits_deducted: wantsPreview ? totalCost : 0,
      remaining_credits: wantsPreview ? remainingPreviewCredits : 0,
      preview_credits_deducted: wantsPreview ? totalCost : 0,
      preview_credits_remaining: remainingPreviewCredits,
      run_id: runUuid
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
