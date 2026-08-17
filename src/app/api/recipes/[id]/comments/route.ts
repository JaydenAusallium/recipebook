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

  const body = await request.json().catch(() => null);
  const content =
    typeof body?.content === "string" ? body.content.trim() : "";
  if (!content || content.length > 2000) {
    return NextResponse.json(
      { error: "Comment must be between 1 and 2000 characters." },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: { content, recipeId: id, authorId: session.user.id },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
