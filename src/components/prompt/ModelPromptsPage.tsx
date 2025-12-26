import Link from "next/link";
import { Sparkles, Video, Zap } from "lucide-react";
import { db } from "@/db";
import { public_prompts } from "@/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import QuickCopyButton from "@/components/prompt/QuickCopyButton";

interface ModelPromptsPageProps {
  title: string;
  subtitle: string;
  description: string;
  modelFilters: string[];
  ctaLabel?: string;
}

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

export async function ModelPromptsPage({
  title,
  subtitle,
  description,
  modelFilters,
  ctaLabel = "Browse full library",
}: ModelPromptsPageProps) {
  const modelConditions = modelFilters.map((model) => ilike(public_prompts.model, model));
  const prompts = await db()
    .select()
    .from(public_prompts)
    .where(and(eq(public_prompts.is_public, true), or(...modelConditions)))
    .orderBy(desc(public_prompts.created_at))
    .limit(60);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-white border-b border-gray-200 pt-16 pb-14 px-4">
        <div className="absolute -top-32 right-0 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-70 pointer-events-none" aria-hidden="true"></div>
        <div className="absolute -bottom-32 left-0 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-70 pointer-events-none" aria-hidden="true"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-6 border border-emerald-100">
            <Sparkles className="w-4 h-4" />
            {subtitle}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 font-display">
            {title}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tools/video-storyboard"
              className="px-6 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-500 transition"
            >
              Generate a storyboard
            </Link>
            <Link
              href="/library"
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              {ctaLabel}
            </Link>
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
                      {(prompt.model ? [prompt.model] : modelFilters).map((m) => (
                        <span key={m} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-100">
                          {m}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                      {prompt.title}
                    </h3>

                    {prompt.description && (
                      <p className="text-sm text-gray-600 mb-4">{prompt.description}</p>
                    )}

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
          <div className="text-center mt-16 text-gray-500">
            No prompts found. Check back soon for curated examples.
          </div>
        )}
      </section>
    </div>
  );
}
