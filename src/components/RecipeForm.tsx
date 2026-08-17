"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ListEditor from "./ListEditor";
import ImageUploader from "./ImageUploader";

export type RecipeFormValues = {
  id?: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  tags: string[];
  imageUrl: string | null;
  imageDriveId: string | null;
  published: boolean;
};

const emptyRecipe: RecipeFormValues = {
  title: "",
  description: "",
  ingredients: [""],
  instructions: [""],
  servings: null,
  prepTimeMinutes: null,
  cookTimeMinutes: null,
  tags: [],
  imageUrl: null,
  imageDriveId: null,
  published: true,
};

export default function RecipeForm({
  initial,
}: {
  initial?: RecipeFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<RecipeFormValues>(initial ?? emptyRecipe);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(initial?.id);

  function set<K extends keyof RecipeFormValues>(key: K, value: RecipeFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/^#/, "");
    if (!tag || values.tags.includes(tag)) return;
    set("tags", [...values.tags, tag]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!values.title.trim()) {
      setError("Please add a title.");
      return;
    }

    setSaving(true);
    const payload = {
      ...values,
      ingredients: values.ingredients.map((i) => i.trim()).filter(Boolean),
      instructions: values.instructions.map((i) => i.trim()).filter(Boolean),
    };

    const url = isEditing ? `/api/recipes/${initial!.id}` : "/api/recipes";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(body.error ?? "Something went wrong. Please try again.");
      return;
    }

    router.push(`/recipes/${body.recipe.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Title</span>
        <input
          autoFocus
          required
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Grandma's Sunday Sauce"
          className="rounded-lg border border-border bg-card px-3.5 py-2.5 text-base outline-none focus:border-brand"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Description</span>
        <textarea
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          placeholder="A short note about this recipe..."
          className="resize-y rounded-lg border border-border bg-card px-3.5 py-2.5 text-base outline-none focus:border-brand"
        />
      </label>

      <ImageUploader
        imageUrl={values.imageUrl}
        imageDriveId={values.imageDriveId}
        onChange={({ imageUrl, imageDriveId }) => {
          set("imageUrl", imageUrl);
          set("imageDriveId", imageDriveId);
        }}
      />

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Servings</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={values.servings ?? ""}
            onChange={(e) =>
              set("servings", e.target.value ? Number(e.target.value) : null)
            }
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-base outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Prep (min)</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={values.prepTimeMinutes ?? ""}
            onChange={(e) =>
              set("prepTimeMinutes", e.target.value ? Number(e.target.value) : null)
            }
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-base outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Cook (min)</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={values.cookTimeMinutes ?? ""}
            onChange={(e) =>
              set("cookTimeMinutes", e.target.value ? Number(e.target.value) : null)
            }
            className="rounded-lg border border-border bg-card px-3 py-2.5 text-base outline-none focus:border-brand"
          />
        </label>
      </div>

      <ListEditor
        label="Ingredients"
        items={values.ingredients}
        onChange={(items) => set("ingredients", items)}
        placeholder="2 cups flour"
        addLabel="Add ingredient"
      />

      <ListEditor
        label="Instructions"
        items={values.instructions}
        onChange={(items) => set("instructions", items)}
        placeholder="Preheat the oven to 350°F"
        ordered
        addLabel="Add step"
      />

      <div>
        <span className="mb-1.5 block text-sm font-medium">Tags</span>
        <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-2">
          {values.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand-dark dark:text-brand"
            >
              #{tag}
              <button
                type="button"
                onClick={() => set("tags", values.tags.filter((t) => t !== tag))}
                aria-label={`Remove ${tag}`}
              >
                ✕
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(tagInput);
                setTagInput("");
              }
            }}
            onBlur={() => {
              if (tagInput) {
                addTag(tagInput);
                setTagInput("");
              }
            }}
            placeholder="dinner, vegan, quick..."
            className="min-w-32 flex-1 border-none bg-transparent px-1 py-1 text-sm outline-none"
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 text-sm font-medium">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(e) => set("published", e.target.checked)}
          className="h-4 w-4 accent-brand"
        />
        Make this recipe public
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand px-6 py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? "Saving..." : isEditing ? "Save changes" : "Save recipe"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-border px-6 py-2.5 font-medium hover:bg-black/5 dark:hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
