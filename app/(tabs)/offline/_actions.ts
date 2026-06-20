"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getDbUserId() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { auth_id: user.id }, select: { id: true } });
  if (!dbUser) throw new Error("User not found");
  return dbUser.id;
}

export async function toggleOfflineLike(eventId: string) {
  const userId = await getDbUserId();
  const key = { event_id_user_id: { event_id: eventId, user_id: userId } };
  const existing = await prisma.offlineEventLike.findUnique({ where: key });
  if (existing) await prisma.offlineEventLike.delete({ where: key });
  else          await prisma.offlineEventLike.create({ data: { event_id: eventId, user_id: userId } });
  revalidatePath(`/offline/${eventId}`);
}

export async function toggleOfflineBookmark(eventId: string) {
  const userId = await getDbUserId();
  const key = { event_id_user_id: { event_id: eventId, user_id: userId } };
  const existing = await prisma.offlineEventBookmark.findUnique({ where: key });
  if (existing) await prisma.offlineEventBookmark.delete({ where: key });
  else          await prisma.offlineEventBookmark.create({ data: { event_id: eventId, user_id: userId } });
  revalidatePath(`/offline/${eventId}`);
}

export async function toggleOfflineJoin(eventId: string) {
  const userId = await getDbUserId();
  const key = { event_id_user_id: { event_id: eventId, user_id: userId } };
  const existing = await prisma.offlineEventJoin.findUnique({ where: key });
  if (existing) await prisma.offlineEventJoin.delete({ where: key });
  else          await prisma.offlineEventJoin.create({ data: { event_id: eventId, user_id: userId } });
  revalidatePath(`/offline/${eventId}`);
}

export async function softDeleteOfflineEvent(eventId: string) {
  const userId = await getDbUserId();
  await prisma.offlineEvent.updateMany({
    where: { id: eventId, author_id: userId },
    data: { status: "deleted" },
  });
  revalidatePath("/offline");
  redirect("/offline");
}

export async function updateOfflineEvent(
  eventId: string,
  data: {
    title: string;
    category: string;
    startDate: string;
    endDate: string;
    sameTime: boolean;
    startTime: string;
    endTime: string;
    dailyTimes: Record<string, { open: string; close: string }>;
    location: string;
    admission: number | null;
    memo: string;
    posterUrl: string | null;
    linkInstagram: string;
    linkTwitter: string;
    linkWebsite: string;
  }
) {
  const userId = await getDbUserId();
  await prisma.offlineEvent.updateMany({
    where: { id: eventId, author_id: userId },
    data: {
      title:          data.title,
      category:       data.category,
      start_date:     data.startDate,
      end_date:       data.endDate,
      same_time:      data.sameTime,
      start_time:     data.startTime,
      end_time:       data.endTime,
      daily_times:    Object.keys(data.dailyTimes).length > 0 ? data.dailyTimes : undefined,
      location:       data.location,
      admission:      data.admission,
      memo:           data.memo || null,
      poster_url:     data.posterUrl,
      link_instagram: data.linkInstagram || null,
      link_twitter:   data.linkTwitter || null,
      link_website:   data.linkWebsite || null,
    },
  });
  revalidatePath("/offline");
  revalidatePath(`/offline/${eventId}`);
  redirect(`/offline/${eventId}`);
}
