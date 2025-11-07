import { respData, respErr } from "@/lib/resp";
import { db } from "@/db";
import { artifacts, runs } from "@/db/schema-extended";
import { users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    // Fetch successful public runs with video artifacts
    const featuredVideos = await db
      .select({
        id: runs.uuid,
        videoUrl: artifacts.url,
        thumbnailUrl: artifacts.metadata,
        prompt: runs.user_input,
        duration: runs.total_duration,
        createdAt: runs.created_at,
        userName: users.nickname,
        userAvatar: users.avatar_url,
      })
      .from(runs)
      .innerJoin(artifacts, eq(artifacts.run_uuid, runs.uuid))
      .leftJoin(users, eq(users.uuid, runs.user_uuid))
      .where(
        and(
          eq(runs.status, "completed"),
          eq(artifacts.type, "video") // Only fetch video artifacts
        )
      )
      .orderBy(desc(runs.created_at))
      .limit(20);

    return respData({
      videos: featuredVideos.map((v) => ({
        id: v.id,
        videoUrl: v.videoUrl,
        thumbnailUrl: v.thumbnailUrl || v.videoUrl, // Fallback to video URL if no thumbnail
        prompt: v.prompt || "No description",
        duration: v.duration || 15,
        createdAt: v.createdAt?.toISOString() || new Date().toISOString(),
        userName: v.userName || "Anonymous",
        userAvatar: v.userAvatar,
      })),
    });
  } catch (error: any) {
    console.error("Failed to fetch featured videos:", error);
    return respErr("Failed to load gallery");
  }
}
