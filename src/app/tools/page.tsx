"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { TOOL_DEFINITIONS } from "@/tools/definitions";

export default function ToolsPage() {
  const tools = Object.values(TOOL_DEFINITIONS);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden bg-white border-b border-gray-200 pt-20 pb-12 px-4">
        <div className="absolute -top-24 right-0 w-72 h-72 bg-emerald-100 rounded-full blur-3xl opacity-70 pointer-events-none" aria-hidden="true"></div>
        <div className="absolute -bottom-24 left-0 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-70 pointer-events-none" aria-hidden="true"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 font-display">Tools</h1>
          <p className="text-lg text-gray-500">
            Launch a tool, generate prompts, and build your next video faster.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  Unlimited prompts
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 font-display">
                {tool.name}
              </h2>
              <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
              <div className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
                Open tool <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
