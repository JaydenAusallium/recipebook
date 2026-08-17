import Link from "next/link";
import type { ReactNode } from "react";

export type RecipeReadoutData = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  tags: string[];
  servings: number | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  ingredients: string[];
  instructions: string[];
  author: { name: string | null };
};

export default function RecipeReadout({
  recipe,
  actions,
}: {
  recipe: RecipeReadoutData;
  actions?: ReactNode;
}) {
  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  return (
    <>
      {recipe.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="mb-5 aspect-[4/3] w-full rounded-2xl object-cover"
        />
      )}

      <Link
        href={`/?category=${encodeURIComponent(recipe.category)}`}
        className="inline-block rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-dark hover:bg-brand/20 dark:text-brand"
      >
        {recipe.category}
      </Link>
      <h1 className="mt-1.5 text-2xl font-bold tracking-tight">{recipe.title}</h1>
      <p className="mt-1 text-sm text-muted">by {recipe.author.name}</p>

      {recipe.description && (
        <p className="mt-3 text-foreground/90">{recipe.description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
        {recipe.servings != null && <span>🍽 Serves {recipe.servings}</span>}
        {recipe.prepTimeMinutes != null && <span>Prep {recipe.prepTimeMinutes}m</span>}
        {recipe.cookTimeMinutes != null && <span>Cook {recipe.cookTimeMinutes}m</span>}
        {totalTime > 0 && <span>⏱ {totalTime}m total</span>}
      </div>

      {recipe.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Link
              key={tag}
              href={`/?tag=${encodeURIComponent(tag)}`}
              className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand-dark hover:bg-brand/20 dark:text-brand"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {actions && <div className="mt-5">{actions}</div>}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Ingredients</h2>
        <ul className="flex flex-col gap-2">
          {recipe.ingredients.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              <span className="text-brand">•</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Instructions</h2>
        <ol className="flex flex-col gap-3">
          {recipe.instructions.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="shrink-0 font-semibold text-brand">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
