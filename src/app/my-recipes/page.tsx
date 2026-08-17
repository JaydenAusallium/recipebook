import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";

export default async function MyRecipesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/my-recipes");
  }

  const recipes = await prisma.recipe.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { likes: true, comments: true } } },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Recipes</h1>
        <Link
          href="/recipes/new"
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
        >
          + New Recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-lg font-medium">No recipes yet.</p>
          <p className="mt-1 text-sm text-muted">
            <Link href="/recipes/new" className="text-brand underline">
              Add your first recipe
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="flex items-center gap-3 p-3.5"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
                {recipe.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="block truncate font-medium hover:text-brand"
                >
                  {recipe.title}
                </Link>
                <p className="text-xs text-muted">
                  {recipe.published ? "Public" : "Private"} · ❤️{" "}
                  {recipe._count.likes} · 💬 {recipe._count.comments}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/recipes/${recipe.id}/edit`}
                  className="text-sm text-muted hover:text-brand"
                >
                  Edit
                </Link>
                <DeleteRecipeButton recipeId={recipe.id} redirectTo="/my-recipes" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
