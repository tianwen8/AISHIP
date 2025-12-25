"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, Clock, Camera, Sun, Music, Zap, Share2 } from "lucide-react";
import { useParams } from "next/navigation";

// Mock Data Structure (matches DB `public_prompts` content_json)
const MOCK_PROMPT_DETAIL = {
  title: "Cyberpunk Detective: Neon Rain",
  description: "A moody, atmospheric opening scene for a sci-fi noir film. Features high-contrast neon lighting, wet surfaces, and a solitary protagonist.",
  thumbnail: "https://fal.media/files/monkey/2wJ-7T3wK_3s4sF_q.png", // Placeholder
  author: "PromptShip Official",
  date: "2025-10-15",
  stats: {
    views: 1250,
    copies: 342,
    rating: 4.9,
  },
  models: ["Sora", "Kling", "Runway Gen-3"],
  // This JSON comes from the AI Director output
  content: {
    logline: "A weary detective walks through a neon-lit alleyway in a futuristic Tokyo, hunting for clues in the rain.",
    master_prompt: {
      sora: "Cinematic digital film, 35mm lens. A futuristic cyberpunk city at night with heavy rain. A detective in a trench coat walks away from camera down a narrow alleyway illuminated by pink and blue neon signs reflecting in puddles. High contrast, moody lighting, volumetric fog. Ultra-realistic textures, 8k resolution.",
      kling: "Cyberpunk detective, neon rain, futuristic city alleyway, back view, trench coat, reflection in puddles, cinematic lighting, 8k, highly detailed, moody atmosphere.",
    },
    shots: [
      {
        id: 1,
        duration: 4,
        description: "Wide shot. Establishing the environment. The detective is a silhouette against the blinding neon lights at the end of the alley.",
        camera: "Static tripod, wide angle 24mm",
        lighting: "Backlit by neon signs, silhouette",
        sound: "Heavy rain, distant sirens, humming of neon lights"
      },
      {
        id: 2,
        duration: 3,
        description: "Close-up. Raindrops falling into a puddle, creating ripples that distort the reflection of a holographic advertisement.",
        camera: "Macro lens, low angle",
        lighting: "Soft reflection",
        sound: "Water splashing, amplified rain sound"
      },
      {
        id: 3,
        duration: 5,
        description: "Medium shot (Tracking). Camera follows the detective from behind as he walks. His trench coat sways. He stops and looks up.",
        camera: "Handheld tracking shot, eye level",
        lighting: "Side lighting from shop windows",
        sound: "Footsteps splashing in water, leather coat creaking"
      }
    ],
    audio: {
      music: "Slow, melancholic synthwave with heavy bass and rain ambience.",
      sfx: "Rain, thunder, footsteps, neon buzz."
    },
    negative_prompt: "cartoon, anime, illustration, low quality, blurry, distorted face, bad hands, text, watermark"
  }
};

export default function PromptDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState<"sora" | "kling" | "shots">("sora");
  const [copied, setCopied] = useState(false);

  // In production: fetch data based on slug
  const data = MOCK_PROMPT_DETAIL;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Visuals (Sticky) */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 space-y-6">
              {/* Main Preview Image */}
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative group">
                <img 
                  src={data.thumbnail} 
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                   <p className="text-white text-sm font-medium">Generated with Flux.1</p>
                </div>
              </div>

              {/* Stats & Metadata */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Prompt Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-500">Views</span>
                    <span className="font-medium text-gray-900">{data.stats.views.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Copies</span>
                    <span className="font-medium text-gray-900">{data.stats.copies.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Models</span>
                    <span className="font-medium text-gray-900">{data.models.join(", ")}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">Created</span>
                    <span className="font-medium text-gray-900">{data.date}</span>
                  </div>
                </div>
                
                <button className="w-full mt-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition">
                  <Share2 className="w-4 h-4" /> Share Prompt
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Content (Scrollable) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Header Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {data.models.map(m => (
                  <span key={m} className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold tracking-wide uppercase">
                    {m} Ready
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{data.title}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{data.description}</p>
            </div>

            {/* Prompt Controller */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                <button 
                  onClick={() => setActiveTab('sora')}
                  className={`flex-1 py-4 text-sm font-semibold transition border-b-2 ${activeTab === 'sora' ? 'border-violet-600 text-violet-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  Sora Prompt
                </button>
                <button 
                  onClick={() => setActiveTab('kling')}
                  className={`flex-1 py-4 text-sm font-semibold transition border-b-2 ${activeTab === 'kling' ? 'border-violet-600 text-violet-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  Kling Prompt
                </button>
                <button 
                  onClick={() => setActiveTab('shots')}
                  className={`flex-1 py-4 text-sm font-semibold transition border-b-2 ${activeTab === 'shots' ? 'border-violet-600 text-violet-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  Full Shot List
                </button>
              </div>

              {/* Content Area */}
              <div className="p-6">
                {activeTab === 'sora' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-sm text-gray-700 leading-relaxed mb-4">
                      {data.content.master_prompt.sora}
                    </div>
                    <button 
                      onClick={() => handleCopy(data.content.master_prompt.sora)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition shadow-sm"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy for Sora"}
                    </button>
                  </div>
                )}

                {activeTab === 'kling' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 font-mono text-sm text-gray-700 leading-relaxed mb-4">
                      {data.content.master_prompt.kling}
                    </div>
                    <button 
                      onClick={() => handleCopy(data.content.master_prompt.kling)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition shadow-sm"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied!" : "Copy for Kling"}
                    </button>
                  </div>
                )}

                {activeTab === 'shots' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {data.content.shots.map((shot, index) => (
                      <div key={shot.id} className="relative pl-8 border-l-2 border-gray-200 pb-2 last:border-0 last:pb-0">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-violet-100 border-2 border-violet-500"></div>
                        
                        <div className="flex items-baseline justify-between mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">Shot {index + 1}</h4>
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {shot.duration}s
                          </span>
                        </div>
                        
                        <p className="text-gray-800 mb-3 font-medium">{shot.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Camera className="w-4 h-4 text-violet-500" />
                            <span>{shot.camera}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Sun className="w-4 h-4 text-orange-500" />
                            <span>{shot.lighting}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg col-span-full">
                            <Music className="w-4 h-4 text-blue-500" />
                            <span>{shot.sound}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Negative Prompt (Collapsible in real app, simplified here) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Negative Prompt</h3>
              <p className="text-gray-500 text-sm font-mono bg-gray-50 p-3 rounded-lg border border-gray-100">
                {data.content.negative_prompt}
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
