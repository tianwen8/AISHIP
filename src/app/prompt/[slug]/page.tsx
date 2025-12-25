import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { public_prompts } from "@/db/schema";
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
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
  const styleLock = content.style_lock || content.styleLock || "";
  const continuityNotes = content.continuity_notes || content.continuityNotes || "";
  const characters = Array.isArray(content.characters) ? content.characters : [];
  const scenePrompt = content.scene_prompt || content.scenePrompt || "";
  const created = formatDate(prompt.created_at || null);

  const [prevPrompt] = await db()
    .select({ slug: public_prompts.slug, title: public_prompts.title })
    .from(public_prompts)
    .where(
      and(
        eq(public_prompts.is_public, true),
        lt(public_prompts.created_at, prompt.created_at)
      )
    )
    .orderBy(desc(public_prompts.created_at))
    .limit(1);

  const [nextPrompt] = await db()
    .select({ slug: public_prompts.slug, title: public_prompts.title })
    .from(public_prompts)
    .where(
      and(
        eq(public_prompts.is_public, true),
        gt(public_prompts.created_at, prompt.created_at)
      )
    )
    .orderBy(asc(public_prompts.created_at))
    .limit(1);

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
  const totalDuration = shots.reduce((sum: number, shot: any) => {
    const duration = Number(shot.duration);
    return Number.isFinite(duration) ? sum + duration : sum;
  }, 0);

  const storyboardPack = (() => {
    const blocks: string[] = [];
    blocks.push(`Title: ${prompt.title}`);
    if (content.logline) {
      blocks.push(`Logline: ${content.logline}`);
    }
    if (styleLock) {
      blocks.push(`Style lock: ${styleLock}`);
    }
    if (characters.length > 0) {
      blocks.push("Characters:");
      characters.forEach((character: any, index: number) => {
        const label = character.id || `Character ${index + 1}`;
        blocks.push(`- ${label}: ${character.anchors || ""}`.trim());
        if (character.prompt) {
          blocks.push(`  Reference prompt: ${character.prompt}`);
        }
      });
    }
    if (scenePrompt) {
      blocks.push(`Scene reference prompt: ${scenePrompt}`);
    }
    if (continuityNotes) {
      blocks.push(`Continuity notes: ${continuityNotes}`);
    }
    if (shots.length > 0) {
      blocks.push("Shot list:");
      shots.forEach((shot: any, index: number) => {
        blocks.push(
          `Shot ${index + 1} (${shot.duration || "?"}s) - ${shot.description || ""} | Camera: ${shot.camera_movement || ""} | Composition: ${shot.composition || ""} | Lighting: ${shot.lighting || ""} | Audio: ${shot.audio_sfx || ""}`.trim()
        );
        if (shot.prompt_en) {
          blocks.push(`Prompt: ${shot.prompt_en}`);
        }
      });
    }
    return blocks.join("\n");
  })();
  const storyboardJson = JSON.stringify(content, null, 2);
  const usageSteps = [
    "Generate character reference images first using the character prompts.",
    "Generate a scene reference image using the scene prompt.",
    "Copy each shot prompt and attach your references for consistent results.",
  ];

  const buildCharacterPrompt = (character: any) => {
    if (character?.prompt) return String(character.prompt);
    if (character?.anchors) {
      return `Character reference sheet: ${character.anchors}. Neutral pose, full body, front view, side view, back view.`;
    }
    return "";
  };

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
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {storyboardPack && (
                    <CopyButton
                      text={storyboardPack}
                      label="Copy storyboard pack"
                      slug={prompt.slug}
                    />
                  )}
                  {allPromptsText && (
                    <CopyButton
                      text={allPromptsText}
                      label="Copy master prompt"
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
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    How to use this storyboard
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    {usageSteps.map((step) => (
                      <div key={step} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-semibold">-</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 font-display">Prompt blocks</h2>
                  {allPromptsText && (
                    <CopyButton
                      text={allPromptsText}
                      label="Copy master prompt"
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

                <div className="flex flex-wrap items-center gap-3">
                  {storyboardPack && (
                    <CopyButton text={storyboardPack} label="Copy storyboard pack" slug={prompt.slug} />
                  )}
                  {storyboardJson && (
                    <CopyButton text={storyboardJson} label="Copy storyboard JSON" slug={prompt.slug} />
                  )}
                </div>
              </div>
            </div>

            {(styleLock || characters.length > 0 || continuityNotes || scenePrompt) && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 font-display">Storyboard anchors</h2>
                  {styleLock && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Style lock</div>
                      <div className="text-sm text-gray-700 bg-gray-50 rounded-lg border border-gray-200 p-4">
                        {styleLock}
                      </div>
                    </div>
                  )}
                  {characters.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Characters</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {characters.map((character: any, index: number) => (
                          <div key={character.id || index} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                            <div className="text-sm font-semibold text-gray-900">{character.id || `Character ${index + 1}`}</div>
                            {character.anchors && (
                              <div className="text-xs text-gray-600 mt-1">{character.anchors}</div>
                            )}
                            {buildCharacterPrompt(character) && (
                              <div className="mt-3">
                                <CopyButton
                                  text={buildCharacterPrompt(character)}
                                  label="Copy character prompt"
                                  slug={prompt.slug}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {scenePrompt && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Scene reference prompt</div>
                      <div className="text-sm text-gray-700 bg-gray-50 rounded-lg border border-gray-200 p-4">
                        {scenePrompt}
                      </div>
                      <div className="mt-3">
                        <CopyButton text={scenePrompt} label="Copy scene prompt" slug={prompt.slug} />
                      </div>
                    </div>
                  )}
                  {continuityNotes && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Continuity notes</div>
                      <div className="text-sm text-gray-700 bg-gray-50 rounded-lg border border-gray-200 p-4">
                        {continuityNotes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {shots.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 font-display">Shot list</h2>
                  <span className="text-xs font-semibold text-gray-500">
                    Total duration: {totalDuration > 0 ? `${totalDuration}s` : "TBD"}
                  </span>
                </div>
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
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        {shot.transition && (
                          <span className="px-2 py-1 rounded border border-gray-200 bg-gray-50">Transition: {shot.transition}</span>
                        )}
                        {shot.camera_movement && (
                          <span className="px-2 py-1 rounded border border-gray-200 bg-gray-50">Camera: {shot.camera_movement}</span>
                        )}
                        {shot.composition && (
                          <span className="px-2 py-1 rounded border border-gray-200 bg-gray-50">Composition: {shot.composition}</span>
                        )}
                        {shot.lighting && (
                          <span className="px-2 py-1 rounded border border-gray-200 bg-gray-50">Lighting: {shot.lighting}</span>
                        )}
                        {shot.audio_sfx && (
                          <span className="px-2 py-1 rounded border border-gray-200 bg-gray-50">Audio: {shot.audio_sfx}</span>
                        )}
                      </div>
                      {shot.prompt_en && (
                        <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs font-mono text-gray-700">
                          {shot.prompt_en}
                        </div>
                      )}
                      {shot.prompt_en && (
                        <div className="mt-3">
                          <CopyButton text={shot.prompt_en} label="Copy shot prompt" slug={prompt.slug} />
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

            {(prevPrompt || nextPrompt) && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 font-display">Continue browsing</h3>
                <div className="flex flex-col md:flex-row gap-3">
                  {prevPrompt && (
                    <Link
                      href={`/prompt/${prevPrompt.slug}`}
                      className="flex-1 border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:bg-emerald-50 transition"
                    >
                      <div className="text-xs text-gray-500 uppercase">Previous</div>
                      <div className="text-sm font-semibold text-gray-900">{prevPrompt.title}</div>
                    </Link>
                  )}
                  {nextPrompt && (
                    <Link
                      href={`/prompt/${nextPrompt.slug}`}
                      className="flex-1 border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:bg-emerald-50 transition"
                    >
                      <div className="text-xs text-gray-500 uppercase">Next</div>
                      <div className="text-sm font-semibold text-gray-900">{nextPrompt.title}</div>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
