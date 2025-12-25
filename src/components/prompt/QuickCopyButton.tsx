"use client";

import { useState } from "react";

export default function QuickCopyButton({
  slug,
  text,
}: {
  slug: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);

    fetch("/api/prompts/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});

    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-900 text-white hover:bg-gray-800 transition"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
