import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import UserPostsTabs from "./_components/UserPostsTabs";

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

export type UserFeedPost = {
  id: string;
  thumbnailUrl: string | null;
  thumbnailType: "IMAGE" | "VIDEO";
  mediaCount: number;
  content: string;
  createdAt: string;
};

export type UserComment = {
  id: string;
  postId: string;
  postThumbnailUrl: string | null;
  content: string;
  createdAt: string;
};

export default async function UserPostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const profile = await prisma.user.findUnique({ where: { username: id } });
  if (!profile) redirect("/feed");

  const [posts, comments] = await Promise.all([
    prisma.post.findMany({
      where: { author_id: profile.id },
      orderBy: { created_at: "desc" },
      include: {
        media: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { media: true } },
      },
    }),
    prisma.postComment.findMany({
      where: { author_id: profile.id },
      orderBy: { created_at: "desc" },
      include: {
        post: {
          include: {
            media: { orderBy: { order: "asc" }, take: 1 },
          },
        },
      },
    }),
  ]);

  const feedPosts: UserFeedPost[] = posts.map((p) => ({
    id: p.id,
    thumbnailUrl: p.media[0]?.url ?? null,
    thumbnailType: p.media[0]?.type ?? "IMAGE",
    mediaCount: p._count.media,
    content: p.content,
    createdAt: formatRelativeTime(p.created_at),
  }));

  const userComments: UserComment[] = comments.map((c) => ({
    id: c.id,
    postId: c.post_id,
    postThumbnailUrl: c.post.media[0]?.url ?? null,
    content: c.content,
    createdAt: formatRelativeTime(c.created_at),
  }));

  return (
    <UserPostsTabs
      username={profile.username}
      feedPosts={feedPosts}
      comments={userComments}
    />
  );
}
