import Link from "next/link";
import { db } from "@/db";
import { public_prompts } from "@/db/schema";
import { and, desc, ilike, eq } from "drizzle-orm";
import QuickCopyButton from "@/components/prompt/QuickCopyButton";

export const dynamic = "force-dynamic";

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

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.map((t) => String(t)).filter(Boolean);
    }
  } catch {
    // fall through
  }
  return trimmed.split(",").map((t) => t.trim()).filter(Boolean);
}

function parseMasterPrompt(raw: string | null): string {
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    const master = parsed.master_prompt || parsed.masterPrompt;
    if (typeof master === "string") return master;
    if (master && typeof master === "object") {
      const first = Object.values(master)[0];
      return first ? String(first) : "";
    }
  } catch {
    return "";
  }
  return "";
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const normalizedTag = tag.toLowerCase();
  const tagLike = `%${normalizedTag}%`;

  const prompts = await db()
    .select()
    .from(public_prompts)
    .where(and(eq(public_prompts.is_public, true), ilike(public_prompts.tags, tagLike)))
    .orderBy(desc(public_prompts.created_at))
    .limit(60);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-white border-b border-gray-200 pt-20 pb-12 px-4">
        <div className="absolute -top-24 right-0 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-70 pointer-events-none" aria-hidden="true"></div>
        <div className="absolute -bottom-24 left-0 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-70 pointer-events-none" aria-hidden="true"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-display">
            #{normalizedTag} prompts
          </h1>
          <p className="text-lg text-gray-500">
            Storyboard prompts optimized for AI video generation.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {TAGS.map((item) => (
              <Link
                key={item}
                href={`/tags/${encodeURIComponent(item)}`}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                  item === normalizedTag
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                #{item}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {prompts.map((prompt) => {
            const tags = parseTags(prompt.tags || "");
            const masterPrompt = parseMasterPrompt(prompt.content_json || "");
            return (
              <Link href={`/prompt/${prompt.slug}`} key={prompt.uuid} className="group">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {prompt.thumbnail_url ? (
                      <img
                        src={prompt.thumbnail_url}
                        alt={prompt.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        No Preview
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {prompt.title}
                    </h3>
                    {prompt.description && (
                      <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {tags.map((tagItem) => (
                        <span key={tagItem} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          #{tagItem}
                        </span>
                      ))}
                    </div>
                    {masterPrompt && (
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Copy without login</span>
                        <QuickCopyButton slug={prompt.slug} text={masterPrompt} />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {prompts.length === 0 && (
          <div className="text-center mt-16 text-gray-500">No prompts found for this tag.</div>
        )}
      </section>
    </div>
  );
}
