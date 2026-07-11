import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth={1.5}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const BookmarkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1.5} className="text-amber-500">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const CommentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="text-blue-500">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

type NotificationKind = "like" | "bookmark" | "comment";

type NotificationItem = {
  key: string;
  kind: NotificationKind;
  actor: { nickname: string; username: string };
  post: { thumbnailUrl: string | null; content: string };
  commentContent?: string;
  at: Date;
};

const KIND_META: Record<NotificationKind, { label: string; Icon: () => React.ReactElement; bg: string }> = {
  like:     { label: "좋아요를 눌렀습니다",  Icon: HeartIcon,    bg: "bg-red-50" },
  bookmark: { label: "북마크했습니다",       Icon: BookmarkIcon, bg: "bg-amber-50" },
  comment:  { label: "댓글을 남겼습니다",    Icon: CommentIcon,  bg: "bg-blue-50" },
};

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const profile = await prisma.user.findUnique({
    where: { username: id },
    select: { id: true, auth_id: true, username: true },
  });
  if (!profile) redirect("/feed");

  // 본인 알림만 열람 가능
  if (profile.auth_id !== authUser.id) redirect(`/${id}`);

  const [likeRows, bookmarkRows, commentRows] = await Promise.all([
    prisma.postLike.findMany({
      where: { post: { author_id: profile.id }, user_id: { not: profile.id } },
      orderBy: { created_at: "desc" },
      take: 100,
      include: {
        user: { select: { nickname: true, username: true } },
        post: { include: { media: { orderBy: { order: "asc" }, take: 1 } } },
      },
    }),
    prisma.postBookmark.findMany({
      where: { post: { author_id: profile.id }, user_id: { not: profile.id } },
      orderBy: { created_at: "desc" },
      take: 100,
      include: {
        user: { select: { nickname: true, username: true } },
        post: { include: { media: { orderBy: { order: "asc" }, take: 1 } } },
      },
    }),
    prisma.postComment.findMany({
      where: { post: { author_id: profile.id }, author_id: { not: profile.id } },
      orderBy: { created_at: "desc" },
      take: 100,
      include: {
        author: { select: { nickname: true, username: true } },
        post: { include: { media: { orderBy: { order: "asc" }, take: 1 } } },
      },
    }),
  ]);

  const notifications: NotificationItem[] = [
    ...likeRows.map((r) => ({
      key: `like-${r.post_id}-${r.user_id}`,
      kind: "like" as const,
      actor: r.user,
      post: { thumbnailUrl: r.post.media[0]?.url ?? null, content: r.post.content },
      at: r.created_at,
    })),
    ...bookmarkRows.map((r) => ({
      key: `bookmark-${r.post_id}-${r.user_id}`,
      kind: "bookmark" as const,
      actor: r.user,
      post: { thumbnailUrl: r.post.media[0]?.url ?? null, content: r.post.content },
      at: r.created_at,
    })),
    ...commentRows.map((r) => ({
      key: `comment-${r.id}`,
      kind: "comment" as const,
      actor: r.author,
      post: { thumbnailUrl: r.post.media[0]?.url ?? null, content: r.post.content },
      commentContent: r.content,
      at: r.created_at,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white flex items-center px-4 h-14 border-b border-stone-100 z-10">
        <Link
          href={`/${id}`}
          className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
        >
          <BackIcon />
        </Link>
        <p className="flex-1 text-center text-sm font-semibold text-stone-800">알림</p>
        <div className="w-9" />
      </div>

      {/* 알림 목록 */}
      {notifications.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-stone-300 text-sm">
          아직 알림이 없습니다.
        </div>
      ) : (
        <ul className="divide-y divide-stone-100">
          {notifications.map((n) => {
            const meta = KIND_META[n.kind];
            return (
              <li key={n.key} className="flex items-start gap-3 px-4 py-4">
                {/* 액터 아바타 + 아이콘 배지 */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-sm font-bold text-stone-500">
                    {n.actor.nickname.charAt(0).toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${meta.bg} flex items-center justify-center`}>
                    <meta.Icon />
                  </span>
                </div>

                {/* 텍스트 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-800 leading-snug">
                    <span className="font-semibold">{n.actor.nickname}</span>
                    <span className="text-stone-400 text-xs ml-1">@{n.actor.username}</span>
                    {"님이 게시물에 "}
                    <span className="font-medium">{meta.label}</span>
                  </p>
                  {n.kind === "comment" && n.commentContent && (
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">"{n.commentContent}"</p>
                  )}
                  <p className="text-xs text-stone-400 mt-1">{formatRelativeTime(n.at)}</p>
                </div>

                {/* 게시글 썸네일 */}
                <div className="w-11 h-11 rounded-lg bg-stone-100 shrink-0 overflow-hidden">
                  {n.post.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.post.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px] text-center px-1 line-clamp-2">
                      {n.post.content}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
