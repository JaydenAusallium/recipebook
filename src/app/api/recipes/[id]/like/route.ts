import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: { id: true, published: true, authorId: true },
  });
  if (
    !recipe ||
    (!recipe.published && recipe.authorId !== session.user.id)
  ) {
    return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_recipeId: { userId: session.user.id, recipeId: id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({
      data: { userId: session.user.id, recipeId: id },
    });
  }

  const count = await prisma.like.count({ where: { recipeId: id } });
  return NextResponse.json({ liked: !existing, count });
}
