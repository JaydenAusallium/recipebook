import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import DeleteRecipeButton from "@/components/DeleteRecipeButton";
import ShareButton from "@/components/ShareButton";
import RecipeReadout from "@/components/RecipeReadout";

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-1.5 flex items-start justify-between gap-3">
        {!recipe.published && (
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs dark:bg-white/10">
            Private
          </span>
        )}
        {isOwner && (
          <div className="ml-auto flex shrink-0 items-center gap-3">
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

      <RecipeReadout
        recipe={recipe}
        actions={
          <div className="flex items-center gap-3">
            <LikeButton
              recipeId={recipe.id}
              initialLiked={session?.user ? recipe.likes.length > 0 : false}
              initialCount={recipe._count.likes}
              signedIn={Boolean(session?.user)}
            />
            <ShareButton recipeId={recipe.id} />
          </div>
        }
      />

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
