"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { estimateWorkflowCost } from "@/services/pricing";

// Duration options
const durations = [
  { value: 8, label: "8s", icon: "⚡" },
  { value: 15, label: "15s", icon: "📱" },
  { value: 30, label: "30s", icon: "🎬" },
];

// Platform options
const platforms = [
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "reels", label: "Instagram Reels", icon: "📷" },
  { value: "shorts", label: "YouTube Shorts", icon: "▶️" },
];

// Voice options
const voices = [
  { value: "none", label: "No Voiceover", icon: "🔇" },
  { value: "female", label: "Female Voice", icon: "👩" },
  { value: "male", label: "Male Voice", icon: "👨" },
];

const featuredTemplates = [
  {
    id: 1,
    title: "Product Showcase",
    thumbnail: "/templates/product-showcase.jpg",
    category: "product",
    uses: 1234,
  },
  {
    id: 2,
    title: "Tutorial Explainer",
    thumbnail: "/templates/tutorial.jpg",
    category: "story",
    uses: 892,
  },
  {
    id: 3,
    title: "Promo Ad",
    thumbnail: "/templates/promo.jpg",
    category: "short",
    uses: 2156,
  },
  {
    id: 4,
    title: "Story Time",
    thumbnail: "/templates/story.jpg",
    category: "story",
    uses: 756,
  },
  {
    id: 5,
    title: "Fashion Lookbook",
    thumbnail: "/templates/fashion.jpg",
    category: "product",
    uses: 1523,
  },
  {
    id: 6,
    title: "Food Recipe",
    thumbnail: "/templates/food.jpg",
    category: "short",
    uses: 945,
  },
  {
    id: 7,
    title: "Travel Vlog",
    thumbnail: "/templates/travel.jpg",
    category: "story",
    uses: 678,
  },
  {
    id: 8,
    title: "Tech Review",
    thumbnail: "/templates/tech.jpg",
    category: "product",
    uses: 1089,
  },
];

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(15);
  const [platform, setPlatform] = useState("tiktok");
  const [voice, setVoice] = useState("none");
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Fetch user credits
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetch("/api/user/credits")
        .then((res) => res.json())
        .then((data) => {
          if (data.code === 0 && data.data) {
            setUserCredits(data.data.left_credits || 0);
          }
        })
        .catch((err) => console.error("Failed to fetch credits:", err));
    }
  }, [status, session]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferencePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove reference file
  const handleRemoveReference = () => {
    setReferenceFile(null);
    setReferencePreview(null);
  };

  // Real-time cost estimation
  useEffect(() => {
    if (prompt.trim()) {
      // Estimate based on duration and voice
      // Assume 3 scenes for MVP estimation
      const sceneCount = Math.ceil(duration / 5); // ~5s per scene
      const hasVoiceover = voice !== "none";

      const cost = estimateWorkflowCost({
        sceneCount,
        totalDurationSeconds: duration,
        hasVoiceover,
        t2iModel: "fal-ai/flux-dev",
        t2vModel: "fal-ai/kling-v1",
        ttsModel: hasVoiceover ? "elevenlabs/turbo-v2" : undefined,
      });

      setEstimatedCost(cost);
    } else {
      setEstimatedCost(0);
    }
  }, [prompt, duration, voice]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a description for your video");
      return;
    }

    // Check if user is logged in
    if (status !== "authenticated") {
      alert("Please sign in to generate videos. New users get 306 free Power Units!");
      router.push("/login");
      return;
    }

    // Check if user has enough Power Units
    if (userCredits !== null && userCredits < estimatedCost) {
      const confirmed = confirm(
        `You have ${userCredits} Power Units but need ${estimatedCost} Power Units. Would you like to purchase more?`
      );
      if (confirmed) {
        router.push("/pricing");
      }
      return;
    }

    setIsGenerating(true);

    try {
      // Create a temporary runId and redirect immediately
      const tempRunId = `temp_${Date.now()}`

      // Store generation params in sessionStorage for canvas to use
      sessionStorage.setItem('generationParams', JSON.stringify({
        prompt,
        duration,
        platform,
        voice,
        referenceImage: referencePreview, // Include reference image base64
      }))

      // Immediately redirect to canvas page
      router.push(`/workspace/${tempRunId}`)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
      setIsGenerating(false)
    }
  }

  // Old synchronous approach (kept as backup)
  const handleGenerateOld = async () => {
    if (!prompt.trim()) {
      alert("Please enter a description for your video");
      return;
    }

    setIsGenerating(true);

    try {
      // Call API to generate workflow
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          duration,
          platform,
          voice,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate workflow");
      }

      const { runUuid } = await response.json();

      // Redirect to canvas page
      router.push(`/workspace/${runUuid}`);
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate workflow. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseTemplate = (templateId: number) => {
    // TODO: Clone template and redirect to canvas
    router.push(`/workspace/new?template=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">AI Video Studio</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </a>

            {status === "authenticated" && session?.user ? (
              <>
                {/* Credit Balance Display */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <span className="text-purple-600">💎</span>
                  <span className="font-semibold text-purple-900">
                    {userCredits !== null ? userCredits : "..."}
                  </span>
                  <span className="text-sm text-purple-600">Power Units</span>
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {session.user.image && (
                      <img
                        src={session.user.image}
                        alt="User avatar"
                        className="w-8 h-8 rounded-full border-2 border-gray-200"
                      />
                    )}
                    <span className="text-sm text-gray-700">{session.user.name || session.user.email}</span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <a href="/login" className="text-gray-600 hover:text-gray-900">
                  Sign In
                </a>
                <a
                  href="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up - Get 306 Power Units
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Create Stunning Videos with AI
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Transform your ideas into engaging content for TikTok, YouTube Shorts, and Instagram Reels
        </p>

        {/* Input Box */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          {/* Prompt Input */}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your video... (e.g., A sunset over ocean waves with calming music)"
            className="w-full h-32 text-lg border-0 outline-none resize-none placeholder-gray-400"
          />

          {/* Reference Image/Video Upload */}
          <div className="border-t border-gray-200 mt-4 pt-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Image or Video (Optional)
            </label>
            {!referencePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-10 h-10 mb-2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, MP4 (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={referencePreview}
                  alt="Reference preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={handleRemoveReference}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            {/* Duration Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <div className="flex gap-3">
                {durations.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDuration(d.value)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                      duration === d.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="mr-1">{d.icon}</span>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <div className="flex gap-3">
                {platforms.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                      platform === p.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="mr-1">{p.icon}</span>
                    <span className="text-sm">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voiceover
              </label>
              <div className="flex gap-3">
                {voices.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => setVoice(v.value)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition ${
                      voice === v.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="mr-1">{v.icon}</span>
                    <span className="text-sm">{v.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cost Estimate (Credits primary, USD secondary) */}
            {estimatedCost > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Estimated Cost:</span>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-700">
                      ~{estimatedCost.toFixed(1)} Power Units
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-4 text-lg font-semibold rounded-lg transition shadow-lg ${
                isGenerating || !prompt.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              }`}
            >
              {isGenerating ? "Generating Workflow..." : "Generate Video →"}
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          New users get 306 Power Units (1 video) • Daily login + share earns 306 more • No credit card required
        </p>
      </section>

      {/* Featured Templates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Templates</h2>
          <a href="/templates" className="text-blue-600 hover:text-blue-700 font-medium">
            View All →
          </a>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group"
            >
              {/* Thumbnail */}
              <div className="aspect-[9/16] bg-gradient-to-br from-gray-200 to-gray-300 relative">
                {/* Placeholder for video thumbnail */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-4xl">
                  🎥
                </div>
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-2xl">▶️</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{template.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{template.uses.toLocaleString()} uses</p>
                <button
                  onClick={() => handleUseTemplate(template.id)}
                  className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:bg-gray-50 transition">
            Load More Templates
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 AI Video Studio. All rights reserved.</p>
            <div className="mt-2 flex justify-center gap-6">
              <a href="/terms" className="hover:text-gray-700">Terms</a>
              <a href="/privacy" className="hover:text-gray-700">Privacy</a>
              <a href="/contact" className="hover:text-gray-700">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
