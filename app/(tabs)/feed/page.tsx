import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { type FeedPost } from "./_types";
import FeedList from "./_components/FeedList";

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  if (h < 24) return `${h}시간 전`;
  if (d < 7) return `${d}일 전`;
  return date.toLocaleDateString("ko-KR");
}

export default async function FeedPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const dbUser = authUser
    ? await prisma.user.findUnique({ where: { auth_id: authUser.id }, select: { id: true } })
    : null;

  const [posts, userLikes, userBookmarks] = await Promise.all([
    prisma.post.findMany({
      orderBy: { created_at: "desc" },
      take: 50,
      include: {
        author: { select: { username: true } },
        media: { orderBy: { order: "asc" } },
        tags: { select: { name: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }),
    dbUser
      ? prisma.postLike.findMany({ where: { user_id: dbUser.id }, select: { post_id: true } })
      : Promise.resolve([]),
    dbUser
      ? prisma.postBookmark.findMany({ where: { user_id: dbUser.id }, select: { post_id: true } })
      : Promise.resolve([]),
  ]);

  const likedIds = new Set(userLikes.map((l) => l.post_id));
  const bookmarkedIds = new Set(userBookmarks.map((b) => b.post_id));

  const feedPosts: FeedPost[] = posts.map((post) => ({
    id: post.id,
    author: { username: post.author.username },
    content: post.content,
    media: post.media.map((m) => ({ id: m.id, url: m.url, type: m.type })),
    tags: post.tags.map((t) => t.name),
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    isLiked: likedIds.has(post.id),
    isBookmarked: bookmarkedIds.has(post.id),
    createdAt: formatRelativeTime(post.created_at),
  }));

  return <FeedList posts={feedPosts} isLoggedIn={!!authUser} />;
}
