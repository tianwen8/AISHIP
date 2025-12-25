import { NextResponse } from "next/server";
import { db } from "@/db";
import { public_prompts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { slug } = await req.json();
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    await db()
      .update(public_prompts)
      .set({ copies: sql`${public_prompts.copies} + 1` })
      .where(eq(public_prompts.slug, slug));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update copy", message: error.message },
      { status: 500 }
    );
  }
}
