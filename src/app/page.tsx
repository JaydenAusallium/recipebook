import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RecipeCard from "@/components/RecipeCard";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q = "", tag = "" } = await searchParams;
  const query = q.trim();
  const tagFilter = tag.trim().toLowerCase();

  const recipes = await prisma.recipe.findMany({
    where: {
      published: true,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { tags: { has: query.toLowerCase() } },
            ],
          }
        : {}),
      ...(tagFilter ? { tags: { has: tagFilter } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {query || tagFilter ? "Search results" : "Recipes"}
          </h1>
          <p className="text-sm text-muted">
            {recipes.length} recipe{recipes.length === 1 ? "" : "s"}
          </p>
        </div>
        <form action="/" className="flex w-full gap-2 sm:w-80">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search recipes or tags..."
            className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
          >
            Search
          </button>
        </form>
      </div>

      {tagFilter && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="text-muted">Filtered by tag:</span>
          <span className="rounded-full bg-brand/10 px-3 py-1 font-medium text-brand-dark dark:text-brand">
            #{tagFilter}
          </span>
          <Link href="/" className="text-muted underline">
            clear
          </Link>
        </div>
      )}

      {recipes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-lg font-medium">No recipes found yet.</p>
          <p className="mt-1 text-sm text-muted">
            Be the first to{" "}
            <Link href="/recipes/new" className="text-brand underline">
              add a recipe
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
