import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import RecipeForm from "@/components/RecipeForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/recipes/${id}/edit`);
  }

  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe) notFound();
  if (recipe.authorId !== session.user.id) {
    redirect(`/recipes/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Edit Recipe</h1>
      <RecipeForm
        initial={{
          id: recipe.id,
          title: recipe.title,
          description: recipe.description ?? "",
          ingredients: recipe.ingredients.length ? recipe.ingredients : [""],
          instructions: recipe.instructions.length ? recipe.instructions : [""],
          servings: recipe.servings,
          prepTimeMinutes: recipe.prepTimeMinutes,
          cookTimeMinutes: recipe.cookTimeMinutes,
          category: recipe.category,
          tags: recipe.tags,
          imageUrl: recipe.imageUrl,
          imageDriveId: recipe.imageDriveId,
          published: recipe.published,
        }}
      />
    </div>
  );
}
