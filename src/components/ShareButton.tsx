"use client";

import { useState } from "react";

export default function ShareButton({ recipeId }: { recipeId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/share/${recipeId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
    >
      {copied ? "Link copied!" : "🔗 Share"}
    </button>
  );
}
