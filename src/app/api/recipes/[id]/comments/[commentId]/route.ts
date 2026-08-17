import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string; commentId: string }> };

export async function DELETE(request: Request, { params }: Context) {
  const { id, commentId } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { recipe: { select: { authorId: true } } },
  });
  if (!comment || comment.recipeId !== id) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  const canDelete =
    comment.authorId === session.user.id ||
    comment.recipe.authorId === session.user.id;
  if (!canDelete) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ ok: true });
}
