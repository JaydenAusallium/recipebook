"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LikeButton({
  recipeId,
  initialLiked,
  initialCount,
  signedIn,
}: {
  recipeId: string;
  initialLiked: boolean;
  initialCount: number;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!signedIn) {
      router.push(`/login?callbackUrl=/recipes/${recipeId}`);
      return;
    }
    if (busy) return;
    setBusy(true);

    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    const res = await fetch(`/api/recipes/${recipeId}/like`, { method: "POST" });
    if (res.ok) {
      const body = await res.json();
      setLiked(body.liked);
      setCount(body.count);
    } else {
      setLiked(!nextLiked);
      setCount((c) => c + (nextLiked ? -1 : 1));
    }
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        liked
          ? "border-brand bg-brand/10 text-brand-dark dark:text-brand"
          : "border-border hover:bg-black/5 dark:hover:bg-white/10"
      }`}
    >
      <span>{liked ? "❤️" : "🤍"}</span>
      {count}
    </button>
  );
}
