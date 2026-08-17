import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseRecipeInput } from "@/lib/recipeValidation";
import { deleteImageFromDrive } from "@/lib/googleDrive";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const { id } = await params;
  const session = await auth();

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true } },
      likes: session?.user
        ? { where: { userId: session.user.id }, select: { id: true } }
        : false,
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
      },
    },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  }

  const isOwner = session?.user?.id === recipe.authorId;
  if (!recipe.published && !isOwner) {
    return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  }

  const { likes, ...rest } = recipe;
  return NextResponse.json({
    recipe: {
      ...rest,
      likedByMe: session?.user ? likes.length > 0 : false,
      isOwner,
    },
  });
}

export async function PUT(request: Request, { params }: Context) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  }
  if (existing.authorId !== session.user.id) {
    return NextResponse.json({ error: "Not your recipe." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseRecipeInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const recipe = await prisma.recipe.update({
    where: { id },
    data: parsed.data,
  });

  if (
    existing.imageDriveId &&
    existing.imageDriveId !== parsed.data.imageDriveId
  ) {
    await deleteImageFromDrive(existing.imageDriveId);
  }

  return NextResponse.json({ recipe });
}

export async function DELETE(request: Request, { params }: Context) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  }
  if (existing.authorId !== session.user.id) {
    return NextResponse.json({ error: "Not your recipe." }, { status: 403 });
  }

  await prisma.recipe.delete({ where: { id } });

  if (existing.imageDriveId) {
    await deleteImageFromDrive(existing.imageDriveId);
  }

  return NextResponse.json({ ok: true });
}
