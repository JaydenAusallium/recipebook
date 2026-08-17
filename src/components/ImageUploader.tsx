"use client";

import { useRef, useState } from "react";

type Props = {
  imageUrl: string | null;
  imageDriveId: string | null;
  onChange: (image: { imageUrl: string | null; imageDriveId: string | null }) => void;
};

export default function ImageUploader({ imageUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? "Upload failed.");
      }
      onChange({ imageUrl: body.url, imageDriveId: body.fileId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">Photo</span>
      <div className="flex items-center gap-4">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-black/5 dark:bg-white/5">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Recipe" className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl">🍽️</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/10"
          >
            {uploading ? "Uploading..." : imageUrl ? "Replace photo" : "Add photo"}
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={() => onChange({ imageUrl: null, imageDriveId: null })}
              className="text-sm text-muted underline"
            >
              Remove photo
            </button>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-muted">
            Stored in Google Drive. JPEG, PNG, WebP or GIF, up to 8MB.
          </p>
        </div>
      </div>
    </div>
  );
}
