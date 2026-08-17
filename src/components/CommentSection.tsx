"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type CommentData = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string | null };
};

export default function CommentSection({
  recipeId,
  initialComments,
  currentUserId,
  recipeOwnerId,
  signedIn,
}: {
  recipeId: string;
  initialComments: CommentData[];
  currentUserId: string | null;
  recipeOwnerId: string;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signedIn) {
      router.push(`/login?callbackUrl=/recipes/${recipeId}`);
      return;
    }
    const content = text.trim();
    if (!content) return;

    setPosting(true);
    setError("");
    const res = await fetch(`/api/recipes/${recipeId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const body = await res.json().catch(() => ({}));
    setPosting(false);

    if (!res.ok) {
      setError(body.error ?? "Could not post comment.");
      return;
    }
    setComments((c) => [...c, body.comment]);
    setText("");
  }

  async function handleDelete(commentId: string) {
    setComments((c) => c.filter((cm) => cm.id !== commentId));
    await fetch(`/api/recipes/${recipeId}/comments/${commentId}`, {
      method: "DELETE",
    });
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      <form onSubmit={handleSubmit} className="mb-5 flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={signedIn ? "Add a comment..." : "Log in to comment"}
          rows={2}
          className="resize-y rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-brand"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={posting || !text.trim()}
          className="self-start rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex justify-between gap-3">
            <div>
              <p className="text-sm">
                <span className="font-semibold">{comment.author.name}</span>{" "}
                <span className="text-xs text-muted">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </p>
              <p className="text-sm text-foreground/90">{comment.content}</p>
            </div>
            {(currentUserId === comment.author.id ||
              currentUserId === recipeOwnerId) && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="shrink-0 text-xs text-muted hover:text-red-600"
              >
                Delete
              </button>
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted">No comments yet. Say something!</p>
        )}
      </div>
    </div>
  );
}
