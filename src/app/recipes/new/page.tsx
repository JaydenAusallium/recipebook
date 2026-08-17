import { redirect } from "next/navigation";
import { auth } from "@/auth";
import RecipeForm from "@/components/RecipeForm";

export default async function NewRecipePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/recipes/new");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">New Recipe</h1>
      <RecipeForm />
    </div>
  );
}
