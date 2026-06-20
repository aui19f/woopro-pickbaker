import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import RecipeDetailModal from "../../../recipe/_components/RecipeDetailModal";
import { type RecipeDetailData } from "../../../recipe/[recipeId]/_components/RecipeDetail";

function formatDate(date: Date): string {
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default async function RecipeDetailModalPage({
  params,
}: {
  params: Promise<{ recipeId: string }>;
}) {
  const { recipeId } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const dbUser = authUser
    ? await prisma.user.findUnique({ where: { auth_id: authUser.id }, select: { id: true } })
    : null;

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: {
      author:      { select: { username: true } },
      images:      { orderBy: { order: "asc" } },
      ingredients: { orderBy: { order: "asc" } },
      steps:       { orderBy: { order: "asc" } },
      _count:      { select: { likes: true } },
    },
  });

  if (!recipe) notFound();

  const [isLiked, isBookmarked, comments] = await Promise.all([
    dbUser
      ? prisma.recipeLike.findUnique({
          where: { recipe_id_user_id: { recipe_id: recipe.id, user_id: dbUser.id } },
        }).then(Boolean)
      : false,
    dbUser
      ? prisma.recipeBookmark.findUnique({
          where: { recipe_id_user_id: { recipe_id: recipe.id, user_id: dbUser.id } },
        }).then(Boolean)
      : false,
    prisma.recipeComment.findMany({
      where: { recipe_id: recipeId },
      orderBy: { created_at: "asc" },
      include: { author: { select: { id: true, username: true } } },
    }),
  ]);

  const data: RecipeDetailData = {
    id:          recipe.id,
    title:       recipe.title,
    category:    recipe.category,
    servings:    recipe.servings,
    author:      { username: recipe.author.username },
    createdAt:   formatDate(recipe.created_at),
    images:      recipe.images.map((img) => ({ url: img.url, order: img.order })),
    ingredients: recipe.ingredients.map((ing) => ({ id: ing.id, name: ing.name, amount: ing.amount })),
    steps:       recipe.steps.map((s) => ({ id: s.id, content: s.content, image_url: s.image_url, order: s.order })),
    memo:        recipe.memo,
    link:        recipe.link,
    likeCount:   recipe._count.likes,
    isLiked:     isLiked as boolean,
    isBookmarked: isBookmarked as boolean,
    comments:    comments.map((c) => ({
      id:        c.id,
      content:   c.content,
      author:    { username: c.author.username },
      createdAt: formatDate(c.created_at),
      isOwn:     dbUser ? c.author.id === dbUser.id : false,
    })),
  };

  return <RecipeDetailModal recipe={data} isLoggedIn={!!authUser} />;
}
