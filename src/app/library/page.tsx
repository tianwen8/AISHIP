import Link from "next/link";
import { Search, Sparkles, Video, Zap } from "lucide-react";
import { db } from "@/db";
import { public_prompts } from "@/db/schema";
import { and, desc, ilike, or, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const FILTERS = [
  { id: "all", label: "All Prompts" },
  { id: "cinematic", label: "Cinematic" },
  { id: "advertising", label: "Advertising" },
  { id: "animation", label: "3D Animation" },
  { id: "drone", label: "Drone / FPV" },
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
    // fall through to split
  }
  return trimmed
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams?: { q?: string; tag?: string };
}) {
  const query = (searchParams?.q || "").trim();
  const tag = (searchParams?.tag || "all").trim().toLowerCase();

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
    .limit(60);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-200 pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Find the perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Video Prompt</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Discover cinematic storyboards and prompts for Sora, Kling, Runway, and Veo. Tested and ready to copy.
          </p>

          <form method="GET" className="relative max-w-2xl mx-auto mb-12">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search styles (e.g. cyberpunk, drone shot, food commercial)"
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-violet-600 focus:ring-4 focus:ring-violet-50 outline-none text-lg transition shadow-sm"
            />
            {tag && tag !== "all" && (
              <input type="hidden" name="tag" value={tag} />
            )}
          </form>

          <div className="flex flex-wrap justify-center gap-2">
            {FILTERS.map((filter) => (
              <Link
                key={filter.id}
                href={`/library?${new URLSearchParams({ q: query || "", tag: filter.id }).toString()}`}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  tag === filter.id
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {prompts.map((prompt) => {
            const tags = parseTags(prompt.tags || "");
            const models = prompt.model ? [prompt.model] : [];
            return (
              <Link href={`/prompt/${prompt.slug}`} key={prompt.uuid} className="group">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {prompt.thumbnail_url ? (
                      <img
                        src={prompt.thumbnail_url}
                        alt={prompt.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        <Video className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> View Prompt Details
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      {models.map((m) => (
                        <span key={m} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs font-semibold rounded-md border border-violet-100">
                          {m}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
                      {prompt.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 mt-auto">
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
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {prompts.length === 0 && (
          <div className="text-center mt-16 text-gray-500">No prompts found.</div>
        )}
      </section>

      <section className="bg-gray-900 text-white py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Why use PromptShip?</h2>
          <p className="text-gray-400 leading-relaxed">
            AI video generation is expensive. Wasting credits on bad prompts hurts.
            PromptShip provides tested, director-approved shot lists that ensure your videos look professional on the first try.
          </p>
        </div>
      </section>
    </div>
  );
}