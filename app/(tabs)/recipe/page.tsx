import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import RecipeListView, { type RecipeListItem } from "./_components/RecipeListView";

function formatDate(date: Date): string {
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default async function RecipePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const dbUser = authUser
    ? await prisma.user.findUnique({ where: { auth_id: authUser.id }, select: { id: true } })
    : null;

  const [recipes, userBookmarks] = await Promise.all([
    prisma.recipe.findMany({
      orderBy: { created_at: "desc" },
      take: 100,
      include: {
        author:  { select: { username: true } },
        images:  { orderBy: { order: "asc" }, take: 1 },
        _count:  { select: { likes: true } },
      },
    }),
    dbUser
      ? prisma.recipeBookmark.findMany({ where: { user_id: dbUser.id }, select: { recipe_id: true } })
      : Promise.resolve([]),
  ]);

  const bookmarkedIds = new Set(userBookmarks.map((b) => b.recipe_id));

  const items: RecipeListItem[] = recipes.map((r) => ({
    id:           r.id,
    title:        r.title,
    category:     r.category,
    thumbnailUrl: r.images[0]?.url ?? null,
    preview:      r.memo ?? null,
    author:       { username: r.author.username },
    createdAt:    formatDate(r.created_at),
    likeCount:    r._count.likes,
    isBookmarked: bookmarkedIds.has(r.id),
  }));

  return <RecipeListView recipes={items} isLoggedIn={!!authUser} />;
}
