"use client";

import { useEffect, useState } from "react";
import { Sparkles, Clapperboard, Video, Download, ArrowRight, Loader2, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getToolDefinition } from "@/tools/definitions";

interface DirectorOutput {
  title: string;
  logline: string;
  shots: Array<{
    id: number;
    duration: number;
    description: string;
    camera_movement: string;
    composition: string;
    lighting: string;
    audio_sfx: string;
    prompt_en: string;
  }>;
  master_prompt: string;
  preview_image_url?: string;
}

export default function AIStoryDirectorPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(15);
  const [style, setStyle] = useState("Cinematic");
  const [withPreviewImage, setWithPreviewImage] = useState(false);
  const [planTier, setPlanTier] = useState<"basic" | "pro" | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<DirectorOutput | null>(null);

  const isPro = planTier === "pro";
  const toolMeta = getToolDefinition("video-storyboard");
  const baseCost = toolMeta?.pricing.baseCost || 20;
  const previewCost = toolMeta?.pricing.previewCost || 30;

  const loadPlan = async () => {
    try {
      const res = await fetch("/api/user/credits");
      const data = await res.json();
      if (data?.code === 0 && data?.data) {
        setPlanTier(data.data.plan_tier || null);
      }
    } catch {
      setPlanTier(null);
    }
  };

  useEffect(() => {
    if (status !== "loading") {
      loadPlan();
    }
  }, [status]);

  useEffect(() => {
    const preset = searchParams.get("prompt");
    if (preset) {
      setPrompt(preset);
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;
    if (trimmedPrompt.length < 5) {
      alert("Please enter at least 5 characters.");
      return;
    }

    if (status === "unauthenticated") {
      alert("Please login to use the AI Director");
      router.push("/login");
      return;
    }

    if (withPreviewImage && !isPro) {
      alert("Preview images are available on Pro only.");
      router.push("/pricing");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/tools/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "video-storyboard",
          input: {
            prompt,
            duration,
            style,
            models: ["sora", "kling", "veo"],
            withPreviewImage,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          alert("Please login to continue.");
          router.push("/login");
          return;
        }
        if (response.status === 402) {
          const confirmPurchase = confirm(
            `Insufficient credits. This run costs ${data.required} credits but you have ${data.current}. Would you like to top up?`
          );
          if (confirmPurchase) {
            router.push("/pricing");
          }
          return;
        }
        if (response.status === 403) {
          alert(data?.error || "Pro only feature.");
          router.push("/pricing");
          return;
        }
        const details = data?.details ? ` ${JSON.stringify(data.details)}` : "";
        throw new Error((data.message || data.error || "Generation failed") + details);
      }

      setResult(data.data);
      window.dispatchEvent(new CustomEvent("credits-updated"));
    } catch (error: any) {
      console.error("Generation error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 font-display">
              <Clapperboard className="w-5 h-5 text-emerald-600" />
              Director's Panel
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Story Idea / Pitch
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., A cyberpunk detective walking in neon rain..."
                  className="w-full h-32 px-4 py-3 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value={8}>8 Seconds</option>
                    <option value={15}>15 Seconds</option>
                    <option value={30}>30 Seconds</option>
                    <option value={60}>60 Seconds</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Visual Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="Cinematic">Cinematic</option>
                    <option value="Anime">Anime</option>
                    <option value="3D Animation">3D Animation</option>
                    <option value="Pixel Art">Pixel Art</option>
                    <option value="Analog Film">Analog Film</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                  isGenerating || !prompt.trim()
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Directing Scene...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Storyboard
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                Cost: {baseCost} credits (text) + {previewCost} credits for Flux preview (Pro)
              </p>

              <div className="flex items-center justify-between gap-3 text-xs text-gray-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={withPreviewImage}
                    onChange={(e) => setWithPreviewImage(e.target.checked)}
                    disabled={!isPro}
                  />
                  Generate Flux preview image
                </label>
                {!isPro && (
                  <button
                    type="button"
                    onClick={() => router.push("/pricing")}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {!result && !isGenerating && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8 text-gray-400">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Video className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-display">Ready for Action</h3>
              <p className="max-w-md">
                Enter your story idea on the left. Our AI Director will break it down into professional shots with camera movements and lighting.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-gray-200 p-8">
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-emerald-600 w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-display">The Director is thinking...</h3>
              <p className="text-gray-500 animate-pulse">Analyzing story arc. Calculating camera angles. Designing lighting.</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start justify-between shadow-sm">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2 font-display">{result.title}</h1>
                  <p className="text-gray-600">{result.logline}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-500 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 rounded-lg transition" title="Save to Library">
                    <Save className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-emerald-600 bg-gray-50 hover:bg-emerald-50 rounded-lg transition" title="Export JSON">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {result.shots.map((shot, index) => (
                  <div key={shot.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-gray-100 min-h-[200px] flex items-center justify-center relative group">
                      {result.preview_image_url ? (
                        <img
                          src={result.preview_image_url}
                          alt="Flux preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <Video className="w-12 h-12 text-gray-300" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition text-white font-medium text-sm">
                            Preview Image (Flux)
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex-1 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </span>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                            {shot.duration}s
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-xs font-medium px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                            {shot.camera_movement}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-900 font-medium mb-4 leading-relaxed">
                        {shot.description}
                      </p>

                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-mono mb-2 uppercase tracking-wider">Prompt</p>
                        <p className="text-sm text-gray-700 font-mono break-all line-clamp-2 hover:line-clamp-none transition-all">
                          {shot.prompt_en}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition flex items-center gap-2 shadow-lg hover:translate-y-[-2px]">
                  Copy All Prompts <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
