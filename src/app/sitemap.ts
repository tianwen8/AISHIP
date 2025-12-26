import { db } from "@/db";
import { public_prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

const TAGS = [
  "cinematic",
  "documentary",
  "advertising",
  "travel",
  "fantasy",
  "sci-fi",
  "thriller",
  "horror",
  "drone",
  "handheld",
  "slow-motion",
  "montage",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";
  const urls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/library`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/sora-prompts`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/veo-prompts`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/kling-prompts`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/seedream-prompts`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/pricing`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/tools/video-storyboard`, changeFrequency: "weekly", priority: 0.7 },
  ];

  TAGS.forEach((tag) => {
    urls.push({
      url: `${baseUrl}/tags/${encodeURIComponent(tag)}`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  const prompts = await db()
    .select({
      slug: public_prompts.slug,
      updated_at: public_prompts.updated_at,
      created_at: public_prompts.created_at,
    })
    .from(public_prompts)
    .where(eq(public_prompts.is_public, true));

  prompts.forEach((prompt) => {
    const lastModified =
      prompt.updated_at || prompt.created_at || new Date().toISOString();
    urls.push({
      url: `${baseUrl}/prompt/${prompt.slug}`,
      lastModified: typeof lastModified === "string" ? lastModified : lastModified.toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  return urls;
}
