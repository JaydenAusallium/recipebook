import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";

type Props = { params: Promise<{ id: string }> };

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { likes: true } },
      likes: session?.user
        ? { where: { userId: session.user.id }, select: { id: true } }
        : false,
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
      },
    },
  });

  if (!recipe) notFound();

  const isOwner = session?.user?.id === recipe.authorId;
  if (!recipe.published && !isOwner) notFound();

  const totalTime =
    (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {recipe.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="mb-5 aspect-[4/3] w-full rounded-2xl object-cover"
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{recipe.title}</h1>
          <p className="mt-1 text-sm text-muted">
            by {recipe.author.name}
            {!recipe.published && (
              <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs dark:bg-white/10">
                Private
              </span>
            )}
          </p>
        </div>
        {isOwner && (
          <div className="flex shrink-0 items-center gap-3">
            <Link
              href={`/recipes/${recipe.id}/edit`}
              className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
            >
              Edit
            </Link>
            <DeleteRecipeButton recipeId={recipe.id} redirectTo="/" />
          </div>
        )}
      </div>

      {recipe.description && (
        <p className="mt-3 text-foreground/90">{recipe.description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
        {recipe.servings != null && <span>🍽 Serves {recipe.servings}</span>}
        {recipe.prepTimeMinutes != null && (
          <span>Prep {recipe.prepTimeMinutes}m</span>
        )}
        {recipe.cookTimeMinutes != null && (
          <span>Cook {recipe.cookTimeMinutes}m</span>
        )}
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

      <div className="mt-5">
        <LikeButton
          recipeId={recipe.id}
          initialLiked={session?.user ? recipe.likes.length > 0 : false}
          initialCount={recipe._count.likes}
          signedIn={Boolean(session?.user)}
        />
      </div>

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

      <section className="mt-10 border-t border-border pt-6">
        <CommentSection
          recipeId={recipe.id}
          initialComments={recipe.comments.map((c) => ({
            ...c,
            createdAt: c.createdAt.toISOString(),
          }))}
          currentUserId={session?.user?.id ?? null}
          recipeOwnerId={recipe.authorId}
          signedIn={Boolean(session?.user)}
        />
      </section>
    </div>
  );
}
