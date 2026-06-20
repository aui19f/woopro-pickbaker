import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import RecipeDetail, { type RecipeDetailData } from "./_components/RecipeDetail";

function formatDate(date: Date): string {
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export default async function RecipeDetailPage({
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

  const [recipe, comments, isLiked, isBookmarked] = await Promise.all([
    prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        author:      { select: { username: true } },
        images:      { orderBy: { order: "asc" } },
        ingredients: { orderBy: { order: "asc" } },
        steps:       { orderBy: { order: "asc" } },
        _count:      { select: { likes: true } },
      },
    }),
    prisma.recipeComment.findMany({
      where: { recipe_id: recipeId },
      orderBy: { created_at: "asc" },
      include: { author: { select: { id: true, username: true } } },
    }),
    dbUser
      ? prisma.recipeLike.findUnique({
          where: { recipe_id_user_id: { recipe_id: recipeId, user_id: dbUser.id } },
        }).then(Boolean)
      : false,
    dbUser
      ? prisma.recipeBookmark.findUnique({
          where: { recipe_id_user_id: { recipe_id: recipeId, user_id: dbUser.id } },
        }).then(Boolean)
      : false,
  ]);

  if (!recipe) notFound();

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

  return (
    <div>
      {/* 헤더 */}
      <div className="sticky top-0 bg-white flex items-center px-4 h-14 border-b border-stone-100 z-10">
        <Link
          href="/recipe"
          className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
        >
          <BackIcon />
        </Link>
        <p className="flex-1 text-center text-sm font-semibold text-stone-800 truncate mx-3">
          {recipe.title}
        </p>
        <div className="w-9" />
      </div>

      <RecipeDetail recipe={data} isLoggedIn={!!authUser} />
    </div>
  );
}
