import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import RecipeReadout from "@/components/RecipeReadout";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: { title: true, description: true },
  });
  if (!recipe) return {};
  return {
    title: `${recipe.title} - Recipebook`,
    description: recipe.description ?? undefined,
  };
}

export default async function SharedRecipePage({ params }: Props) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  });

  if (!recipe) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between rounded-xl bg-black/5 px-3.5 py-2 text-xs text-muted dark:bg-white/5">
        <span>👀 Shared read-only view</span>
        <Link href="/" className="font-medium text-brand underline">
          Browse more recipes
        </Link>
      </div>

      <RecipeReadout recipe={recipe} />
    </div>
  );
}
