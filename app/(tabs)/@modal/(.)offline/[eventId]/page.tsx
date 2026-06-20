import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import OfflineDetailModal from "../../../offline/_components/OfflineDetailModal";
import { type OfflineEventDetail } from "../../../offline/_components/EventDetailContent";

export default async function OfflineDetailModalPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const [row, dbUser] = await Promise.all([
    prisma.offlineEvent.findUnique({
      where: { id: eventId },
      include: { _count: { select: { likes: true, bookmarks: true, joins: true } } },
    }),
    authUser
      ? prisma.user.findUnique({ where: { auth_id: authUser.id }, select: { id: true } })
      : null,
  ]);

  if (!row || row.status === "deleted") notFound();

  const isOwner = dbUser ? row.author_id === dbUser.id : false;

  const [isLiked, isBookmarked, isJoined] = dbUser
    ? await Promise.all([
        prisma.offlineEventLike.findUnique({
          where: { event_id_user_id: { event_id: eventId, user_id: dbUser.id } },
        }).then(Boolean),
        prisma.offlineEventBookmark.findUnique({
          where: { event_id_user_id: { event_id: eventId, user_id: dbUser.id } },
        }).then(Boolean),
        prisma.offlineEventJoin.findUnique({
          where: { event_id_user_id: { event_id: eventId, user_id: dbUser.id } },
        }).then(Boolean),
      ])
    : [false, false, false];

  const fmt = (d: Date) => d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });

  const event: OfflineEventDetail = {
    id:            row.id,
    title:         row.title,
    startDate:     row.start_date,
    endDate:       row.end_date,
    startTime:     row.start_time,
    endTime:       row.end_time,
    location:      row.location,
    posterUrl:     row.poster_url ?? null,
    memo:          row.memo ?? null,
    linkInstagram: row.link_instagram ?? null,
    linkTwitter:   row.link_twitter ?? null,
    linkWebsite:   row.link_website ?? null,
    createdAt:     fmt(row.created_at),
    updatedAt:     fmt(row.updated_at),
    likeCount:     row._count.likes,
    bookmarkCount: row._count.bookmarks,
    joinCount:     row._count.joins,
    isLiked:       isLiked as boolean,
    isBookmarked:  isBookmarked as boolean,
    isJoined:      isJoined as boolean,
  };

  return <OfflineDetailModal event={event} isOwner={isOwner} isLoggedIn={!!authUser} />;
}
