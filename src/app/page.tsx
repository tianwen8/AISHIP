"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Sparkles, Film, Video, Zap, CheckCircle2, PlayCircle, HelpCircle, ArrowRight } from "lucide-react";

// Mock Data: Cinematic Prompts (For Showcase)
const MOCK_PROMPTS = [
  {
    id: "cyberpunk-detective",
    title: "Cyberpunk Detective: Neon Rain",
    slug: "cyberpunk-detective-neon-rain",
    thumbnail: "https://fal.media/files/monkey/2wJ-7T3wK_3s4sF_q.png", 
    models: ["Sora", "Kling"],
    tags: ["Cyberpunk", "Sci-Fi"],
    views: 1250,
  },
  {
    id: "wes-anderson-kitchen",
    title: "Symmetrical Pastel Kitchen",
    slug: "wes-anderson-style-kitchen",
    thumbnail: "https://fal.media/files/lion/4hK-9U2wL_8s2sD_p.png", 
    models: ["Veo", "Runway"],
    tags: ["Wes Anderson", "Symmetry"],
    views: 890,
  },
  {
    id: "fpv-drone-forest",
    title: "Fast FPV Drone Through Forest",
    slug: "fpv-drone-racing-forest",
    thumbnail: "https://fal.media/files/tiger/7jM-1X5wN_6s9sA_r.png", 
    models: ["Kling", "Luma"],
    tags: ["FPV", "Action"],
    views: 2100,
  },
];

const FAQS = [
  {
    q: "How does the AI Director work?",
    a: "Unlike simple prompt generators, our AI Director thinks like a filmmaker. It breaks your story idea into a structured shot list (storyboard), assigning camera movements, lighting, and sound to each shot for maximum cinematic effect."
  },
  {
    q: "Which video models do you support?",
    a: "We generate optimized prompts for OpenAI Sora, Kuaishou Kling, Runway Gen-3, and Google Veo. You can copy the specific prompt format for your preferred model."
  },
  {
    q: "Can I generate long stories?",
    a: "Yes! Our tool supports 'Episodic Mode'. Paste a long script, and the AI will break it down into multiple scenes, helping you generate a consistent series."
  },
  {
    q: "Do I get a refund if the prompt fails?",
    a: "We guarantee the structure of the prompt. While we can't control the random nature of AI video models, our 'Director's Cut' prompts are tested to have a much higher success rate than raw text."
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. Hero Section (SEO H1) */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-semibold mb-8 border border-violet-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4" />
            <span>Now supporting Sora & Kling V1.6</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
            Stop Guessing Prompts. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Start Directing.</span>
          </h1>
          
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Transform vague ideas into Hollywood-level <strong>shot lists</strong> and <strong>storyboards</strong>. 
            The only AI tool that understands camera movement, lighting, and narrative structure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/tools/video-storyboard"
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white text-lg font-bold rounded-xl hover:bg-gray-800 transition shadow-lg hover:translate-y-[-2px] flex items-center justify-center gap-2"
            >
              <Video className="w-5 h-5" />
              Direct My Movie
            </Link>
            <Link 
              href="#showcase"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              Explore Showcase
            </Link>
          </div>
        </div>
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-30 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div 
            className="absolute top-20 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"
            style={{ animationDelay: "2s" }}
          ></div>
          <div 
            className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>
      </section>

      {/* 2. Features Grid (Why Us?) */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Creators Choose PromptShip</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Writing prompts is hard. Directing is harder. We automate the technical stuff so you can focus on the story.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Structured Shot Lists</h3>
              <p className="text-gray-500 leading-relaxed">Don't just get a block of text. Get a breakdown: Shot 1 (Wide), Shot 2 (Close-up). Perfect for editing consistency.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-6 text-violet-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Model Support</h3>
              <p className="text-gray-500 leading-relaxed">Sora needs different words than Kling. Our engine translates your idea into the native language of each AI model.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6 text-orange-600">
                <PlayCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Visual Previews (Flux)</h3>
              <p className="text-gray-500 leading-relaxed">See it before you generate it. We generate a high-quality keyframe preview for every prompt using Flux.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Showcase (The "Library") */}
      <section id="showcase" className="py-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Showcase</h2>
              <p className="text-gray-500">Copy tested prompts from our community.</p>
            </div>
            <Link href="/library" className="hidden sm:flex items-center gap-2 text-violet-600 font-medium hover:text-violet-700">
              View All Prompts <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_PROMPTS.map((prompt) => (
              <Link href={`/prompt/${prompt.slug}`} key={prompt.id} className="group block">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {/* Placeholder */}
                     <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                       <Video className="w-12 h-12 opacity-20" />
                     </div>
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-white font-bold px-4 py-2 border-2 border-white rounded-lg">View Details</span>
                     </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                       {prompt.models.map(m => (
                         <span key={m} className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded">{m}</span>
                       ))}
                    </div>
                    <h3 className="font-bold text-gray-900 truncate">{prompt.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                       <CheckCircle2 className="w-3 h-3 text-green-500" /> Tested working
                       <span>• {prompt.views} views</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/library" className="text-violet-600 font-medium">View All Prompts →</Link>
          </div>
        </div>
      </section>

      {/* 4. FAQ Section (SEO Rich Snippets) */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500">Everything you need to know about AI video direction.</p>
          </div>
          
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-violet-500 mt-0.5 shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 ml-8 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4 text-white">
               <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold">P</div>
               <span className="text-xl font-bold">PromptShip</span>
            </div>
            <p className="text-sm max-w-xs">Building the future of AI storytelling. One shot at a time.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tools/video-storyboard" className="hover:text-white">AI Director</Link></li>
              <li><Link href="/library" className="hover:text-white">Prompt Library</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          © 2025 PromptShip AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}