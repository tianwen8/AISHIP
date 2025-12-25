import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { public_prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import CopyButton from "@/components/prompt/CopyButton";
import ViewTracker from "@/components/prompt/ViewTracker";

export const dynamic = "force-dynamic";

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

function parseContent(raw: string | null): any {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function formatDate(value: Date | string | null): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [prompt] = await db()
    .select()
    .from(public_prompts)
    .where(eq(public_prompts.slug, slug))
    .limit(1);

  if (!prompt) {
    notFound();
  }

  const tags = parseTags(prompt.tags || "");
  const content = parseContent(prompt.content_json || "");
  const shots = Array.isArray(content.shots) ? content.shots : [];
  const master = content.master_prompt || content.masterPrompt;
  const negative = content.negative_prompt || content.negativePrompt || "";
  const created = formatDate(prompt.created_at || null);

  let promptBlocks: Array<{ label: string; text: string }> = [];
  if (typeof master === "string") {
    promptBlocks = [{ label: "Master prompt", text: master }];
  } else if (master && typeof master === "object") {
    promptBlocks = Object.entries(master).map(([key, value]) => ({
      label: `${key} prompt`,
      text: String(value),
    }));
  }

  const allPromptsText = promptBlocks.map((p) => p.text).join("\n\n");

  return (
    <div className="min-h-screen bg-gray-50">
      <ViewTracker slug={prompt.slug} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                {prompt.thumbnail_url ? (
                  <img
                    src={prompt.thumbnail_url}
                    alt={prompt.title}
                    className="w-full h-auto object-cover"
                  />
                ) : (
                  <div className="aspect-video w-full bg-gray-900" />
                )}
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Prompt stats</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Views</div>
                    <div className="font-medium text-gray-900">{prompt.views}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Copies</div>
                    <div className="font-medium text-gray-900">{prompt.copies}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Model</div>
                    <div className="font-medium text-gray-900">{prompt.model || "-"}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Created</div>
                    <div className="font-medium text-gray-900">{created || "-"}</div>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3">
                  {allPromptsText && (
                    <CopyButton
                      text={allPromptsText}
                      label="Copy all"
                      slug={prompt.slug}
                    />
                  )}
                  <Link
                    href={`/tools/video-storyboard?prompt=${encodeURIComponent(prompt.title)}`}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Generate from this prompt
                  </Link>
                </div>
                <Link
                  href="/library"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600"
                >
                  Back to library
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4 font-display">
                {prompt.title}
              </h1>
              {prompt.description && (
                <p className="text-lg text-gray-600 leading-relaxed">{prompt.description}</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 font-display">Prompt blocks</h2>
                  {allPromptsText && (
                    <CopyButton
                      text={allPromptsText}
                      label="Copy all"
                      slug={prompt.slug}
                    />
                  )}
                </div>

                {promptBlocks.length === 0 && (
                  <div className="text-sm text-gray-500">No prompt content available.</div>
                )}

                {promptBlocks.map((block) => (
                  <div key={block.label} className="space-y-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase">{block.label}</div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-sm text-gray-700 leading-relaxed">
                      {block.text}
                    </div>
                    <CopyButton
                      text={block.text}
                      label={`Copy ${block.label}`}
                      slug={prompt.slug}
                    />
                  </div>
                ))}
              </div>
            </div>

            {shots.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 font-display">Shot list</h2>
                <div className="space-y-6">
                  {shots.map((shot: any, index: number) => (
                    <div key={shot.id || index} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">Shot {index + 1}</h3>
                        {shot.duration && (
                          <span className="text-xs text-gray-500">{shot.duration}s</span>
                        )}
                      </div>
                      {shot.description && (
                        <p className="text-sm text-gray-700 mb-2">{shot.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {shot.camera_movement && <div>Camera: {shot.camera_movement}</div>}
                        {shot.composition && <div>Composition: {shot.composition}</div>}
                        {shot.lighting && <div>Lighting: {shot.lighting}</div>}
                        {shot.audio_sfx && <div>Audio: {shot.audio_sfx}</div>}
                      </div>
                      {shot.prompt_en && (
                        <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs font-mono text-gray-700">
                          {shot.prompt_en}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {negative && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-3 font-display">Negative prompt</h3>
                <p className="text-gray-500 text-sm font-mono bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {negative}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
