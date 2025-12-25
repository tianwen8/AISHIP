import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, tool_runs, credits } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTool } from "@/tools/registry";
import { getToolCost } from "@/tools/definitions";
import { nanoid } from "nanoid";
import { creditsToUnits } from "@/services/pricing";
import { getUserCredits } from "@/services/credit";
import { FalT2IAdapter } from "@/integrations/ai-adapters/fal";

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
    // IMPORTANT: Use the model layer so we apply the same unit conversion rules everywhere.
    // Credits are stored as micro-units in DB; model converts back to display units.
    const userCredits = await getUserCredits(user.uuid);
    const currentBalance = userCredits.left_credits || 0;
    const wantsPreview = !!safeInput.withPreviewImage;
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

    if (currentBalance < totalCost) {
      return NextResponse.json(
        { error: "Insufficient credits", required: totalCost, current: currentBalance },
        { status: 402 } // Payment Required
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
    
    await db().transaction(async (tx) => {
      // A. Deduct Credits
      await tx.insert(credits).values({
        trans_no: `USE_${runUuid}`,
        user_uuid: user.uuid,
        trans_type: "deduct",
        // Store as micro-units in DB for consistency with the pricing module/model layer.
        credits: creditsToUnits(-totalCost),
        created_at: new Date(),
        // order_no can be null for usage
      });

      // B. Save Tool Run
      await tx.insert(tool_runs).values({
        uuid: runUuid,
        user_uuid: user.uuid,
        tool_id: tool.meta.id,
        status: "completed",
        cost_credits: totalCost,
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
    });

    // 8. Return Success
    return NextResponse.json({
      success: true,
      data: output,
      credits_deducted: totalCost,
      remaining_credits: currentBalance - totalCost,
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
