export type RecipeInput = {
  title: string;
  description: string | null;
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

function cleanStringList(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, max);
}

function toNullableInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100000) return null;
  return Math.round(n);
}

export function parseRecipeInput(
  body: unknown
): { data: RecipeInput } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Invalid request body." };
  }
  const b = body as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title || title.length > 140) {
    return { error: "Title is required and must be under 140 characters." };
  }

  const description =
    typeof b.description === "string" && b.description.trim()
      ? b.description.trim().slice(0, 2000)
      : null;

  const ingredients = cleanStringList(b.ingredients, 100);
  if (ingredients.length === 0) {
    return { error: "Add at least one ingredient." };
  }

  const instructions = cleanStringList(b.instructions, 100);
  if (instructions.length === 0) {
    return { error: "Add at least one instruction step." };
  }

  const tags = cleanStringList(b.tags, 20).map((t) => t.toLowerCase());

  const imageUrl = typeof b.imageUrl === "string" && b.imageUrl ? b.imageUrl : null;
  const imageDriveId =
    typeof b.imageDriveId === "string" && b.imageDriveId ? b.imageDriveId : null;

  const published = typeof b.published === "boolean" ? b.published : true;

  return {
    data: {
      title,
      description,
      ingredients,
      instructions,
      servings: toNullableInt(b.servings),
      prepTimeMinutes: toNullableInt(b.prepTimeMinutes),
      cookTimeMinutes: toNullableInt(b.cookTimeMinutes),
      tags,
      imageUrl,
      imageDriveId,
      published,
    },
  };
}
