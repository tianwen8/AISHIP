import Link from "next/link";
import { Search, Sparkles, Video, Zap, ArrowRight } from "lucide-react";
import { db } from "@/db";
import { public_prompts } from "@/db/schema";
import { and, desc, ilike, or, eq } from "drizzle-orm";
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

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; tag?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = (resolvedParams?.q || "").trim();
  const tag = (resolvedParams?.tag || "all").trim().toLowerCase();

  const conditions: any[] = [eq(public_prompts.is_public, true)];
  if (query) {
    const like = `%${query}%`;
    conditions.push(
      or(
        ilike(public_prompts.title, like),
        ilike(public_prompts.description, like),
        ilike(public_prompts.tags, like)
      )
    );
  }
  if (tag !== "all") {
    const tagLike = `%${tag}%`;
    conditions.push(ilike(public_prompts.tags, tagLike));
  }

  const prompts = await db()
    .select()
    .from(public_prompts)
    .where(and(...conditions))
    .orderBy(desc(public_prompts.created_at))
    .limit(80);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-white border-b border-gray-200 pt-16 pb-12 px-4">
        <div className="absolute -top-32 right-0 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-70 pointer-events-none" aria-hidden="true"></div>
        <div className="absolute -bottom-40 left-0 w-80 h-80 bg-teal-100 rounded-full blur-3xl opacity-70 pointer-events-none" aria-hidden="true"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-6 border border-emerald-100">
            <Sparkles className="w-4 h-4" />
            AI video prompts and storyboards
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-5 font-display">
            PromptShip: AI Video Prompts Library
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore cinematic storyboards and prompts for Sora, Kling, Runway, and Veo. Copy, remix, and build your next video faster.
          </p>

          <form method="GET" className="relative max-w-3xl mx-auto mt-8">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search prompts (cyberpunk, drone, product ad...)"
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50 outline-none text-lg transition shadow-sm"
            />
            {tag && tag !== "all" && (
              <input type="hidden" name="tag" value={tag} />
            )}
          </form>

          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              href="/tools/video-storyboard"
              className="px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-500 transition"
            >
              Generate a Storyboard
            </Link>
            <Link
              href="/library"
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Browse Full Library
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs uppercase tracking-wider text-gray-400 mr-2">Popular video tags</span>
            {TAGS.map((tagItem) => (
              <Link
                key={tagItem}
                href={`/tags/${encodeURIComponent(tagItem)}`}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                  tag === tagItem
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                #{tagItem}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Shot-level precision",
              copy: "Every storyboard includes shot duration, framing, movement, and lighting notes.",
            },
            {
              title: "Story continuity baked in",
              copy: "Characters, props, and tone stay consistent from the opening to the final beat.",
            },
            {
              title: "Built for video models",
              copy: "Prompts are tuned for Sora, Veo, Kling, and Runway style generation.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-display">Latest storyboards</h2>
            <p className="text-sm text-gray-500">
              {tag !== "all" ? `Filtered by #${tag}` : "Curated for video-first prompts."}
            </p>
          </div>
          <Link href="/library" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            View all
          </Link>
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          {prompts.map((prompt) => {
            const tags = parseTags(prompt.tags || "");
            const models = prompt.model ? [prompt.model] : [];
            const masterPrompt = parseMasterPrompt(prompt.content_json || "");
            return (
              <Link
                href={`/prompt/${prompt.slug}`}
                key={prompt.uuid}
                className="group mb-6 inline-block w-full break-inside-avoid"
              >
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="bg-gray-100 relative overflow-hidden">
                    {prompt.thumbnail_url ? (
                      <img
                        src={prompt.thumbnail_url}
                        alt={prompt.title}
                        className="w-full h-auto object-cover"
                      />
                    ) : (
                      <div className="aspect-video w-full flex items-center justify-center bg-gray-200 text-gray-400">
                        <Video className="w-10 h-10 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-medium">View prompt</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {models.map((m) => (
                        <span key={m} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-100">
                          {m}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {prompt.title}
                    </h3>

                    {prompt.description && (
                      <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {tags.map((tagItem) => (
                        <span key={tagItem} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          #{tagItem}
                        </span>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between text-xs text-gray-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" /> {prompt.copies} copies
                      </span>
                      <span>{prompt.views} views</span>
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
          <div className="text-center text-gray-500 mt-10">No prompts found.</div>
        )}
      </section>

      <section className="bg-gray-900 text-white py-14 mt-6">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3 font-display">Share prompts, grow your audience</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            PromptShip is a community prompt library for AI video creators. Share your best storyboards and discover what works.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
                  <Link href="/library" className="text-white font-semibold inline-flex items-center gap-2">
                    Explore library <ArrowRight className="w-4 h-4" />
                  </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
