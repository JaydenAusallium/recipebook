import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseRecipeInput } from "@/lib/recipeValidation";

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const tag = searchParams.get("tag")?.trim().toLowerCase() ?? "";
  const mine = searchParams.get("mine") === "1";

  if (mine && !session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const recipes = await prisma.recipe.findMany({
    where: {
      ...(mine
        ? { authorId: session!.user.id }
        : { published: true }),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { tags: { has: q.toLowerCase() } },
            ],
          }
        : {}),
      ...(tag ? { tags: { has: tag } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true } },
      likes: session?.user
        ? { where: { userId: session.user.id }, select: { id: true } }
        : false,
    },
  });

  const data = recipes.map(({ likes, ...recipe }) => ({
    ...recipe,
    likedByMe: session?.user ? likes.length > 0 : false,
  }));

  return NextResponse.json({ recipes: data });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parseRecipeInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const recipe = await prisma.recipe.create({
    data: { ...parsed.data, authorId: session.user.id },
  });

  return NextResponse.json({ recipe }, { status: 201 });
}
