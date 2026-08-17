import Link from "next/link";

export type RecipeCardData = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  tags: string[];
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  author: { id: string; name: string | null };
  _count: { likes: number; comments: number };
};

export default function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  const totalTime =
    (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-black/5 dark:bg-white/5">
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            🍽️
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 font-semibold leading-snug">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="line-clamp-2 text-sm text-muted">
            {recipe.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted">
          <span className="truncate">by {recipe.author.name}</span>
          <span className="flex shrink-0 items-center gap-2.5">
            {totalTime > 0 && <span>⏱ {totalTime}m</span>}
            <span>❤️ {recipe._count.likes}</span>
            <span>💬 {recipe._count.comments}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
