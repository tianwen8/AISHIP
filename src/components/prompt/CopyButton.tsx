"use client";

import { useState } from "react";

export default function CopyButton({
  text,
  label,
  slug,
}: {
  text: string;
  label: string;
  slug?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    if (slug) {
      fetch("/api/prompts/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      }).catch(() => {});
    }
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
