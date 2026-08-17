"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteRecipeButton({
  recipeId,
  redirectTo = "/my-recipes",
  className,
}: {
  recipeId: string;
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/recipes/${recipeId}`, { method: "DELETE" });
    if (res.ok) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-sm text-muted">Delete recipe?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-full bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-muted underline"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className={className ?? "text-sm text-muted hover:text-red-600"}
    >
      Delete
    </button>
  );
}
