import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getEventStatus } from "../../offline/_data/mock";
import SavedTabs, {
  type SavedFeedPost,
  type SavedRecipe,
  type SavedOfflineEvent,
} from "./_components/SavedTabs";

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export default async function SavedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const profile = await prisma.user.findUnique({ where: { username: id }, select: { id: true, username: true } });
  if (!profile) redirect("/feed");

  const [
    likedPostRows,
    bookmarkedPostRows,
    likedRecipeRows,
    bookmarkedRecipeRows,
    joinedEventRows,
    bookmarkedEventRows,
  ] = await Promise.all([
    prisma.postLike.findMany({
      where: { user_id: profile.id },
      orderBy: { created_at: "desc" },
      include: { post: { include: { media: { orderBy: { order: "asc" }, take: 1 } } } },
    }),
    prisma.postBookmark.findMany({
      where: { user_id: profile.id },
      orderBy: { created_at: "desc" },
      include: { post: { include: { media: { orderBy: { order: "asc" }, take: 1 } } } },
    }),
    prisma.recipeLike.findMany({
      where: { user_id: profile.id },
      orderBy: { created_at: "desc" },
      include: { recipe: { include: { images: { orderBy: { order: "asc" }, take: 1 } } } },
    }),
    prisma.recipeBookmark.findMany({
      where: { user_id: profile.id },
      orderBy: { created_at: "desc" },
      include: { recipe: { include: { images: { orderBy: { order: "asc" }, take: 1 } } } },
    }),
    prisma.offlineEventJoin.findMany({
      where: { user_id: profile.id },
      orderBy: { created_at: "desc" },
      include: { event: true },
    }),
    prisma.offlineEventBookmark.findMany({
      where: { user_id: profile.id },
      orderBy: { created_at: "desc" },
      include: { event: true },
    }),
  ]);

  const likedPosts: SavedFeedPost[] = likedPostRows.map((r) => ({
    id: r.post.id,
    thumbnailUrl: r.post.media[0]?.url ?? null,
    content: r.post.content,
  }));

  const bookmarkedPosts: SavedFeedPost[] = bookmarkedPostRows.map((r) => ({
    id: r.post.id,
    thumbnailUrl: r.post.media[0]?.url ?? null,
    content: r.post.content,
  }));

  const likedRecipes: SavedRecipe[] = likedRecipeRows.map((r) => ({
    id: r.recipe.id,
    title: r.recipe.title,
    category: r.recipe.category,
    thumbnailUrl: r.recipe.images[0]?.url ?? null,
  }));

  const bookmarkedRecipes: SavedRecipe[] = bookmarkedRecipeRows.map((r) => ({
    id: r.recipe.id,
    title: r.recipe.title,
    category: r.recipe.category,
    thumbnailUrl: r.recipe.images[0]?.url ?? null,
  }));

  const joinedEvents: SavedOfflineEvent[] = joinedEventRows
    .filter((r) => r.event.status !== "deleted")
    .map((r) => ({
      id: r.event.id,
      title: r.event.title,
      startDate: r.event.start_date,
      endDate: r.event.end_date,
      posterUrl: r.event.poster_url ?? null,
      status: getEventStatus(r.event.start_date, r.event.end_date),
      type: "joined" as const,
    }));

  const bookmarkedEvents: SavedOfflineEvent[] = bookmarkedEventRows
    .filter((r) => r.event.status !== "deleted")
    .map((r) => ({
      id: r.event.id,
      title: r.event.title,
      startDate: r.event.start_date,
      endDate: r.event.end_date,
      posterUrl: r.event.poster_url ?? null,
      status: getEventStatus(r.event.start_date, r.event.end_date),
      type: "bookmarked" as const,
    }));

  return (
    <div>
      <div className="sticky top-0 bg-white flex items-center px-4 h-14 border-b border-stone-100 z-10">
        <Link
          href={`/${id}`}
          className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
        >
          <BackIcon />
        </Link>
        <p className="flex-1 text-center text-sm font-semibold text-stone-800">저장됨</p>
        <div className="w-9" />
      </div>
      <SavedTabs
        likedPosts={likedPosts}
        bookmarkedPosts={bookmarkedPosts}
        likedRecipes={likedRecipes}
        bookmarkedRecipes={bookmarkedRecipes}
        joinedEvents={joinedEvents}
        bookmarkedEvents={bookmarkedEvents}
      />
    </div>
  );
}
