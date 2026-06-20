"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOfflineEvent(data: {
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
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({ where: { auth_id: user.id } });
  if (!dbUser) throw new Error("User not found");

  await prisma.offlineEvent.create({
    data: {
      author_id:     dbUser.id,
      title:         data.title,
      category:      data.category,
      start_date:    data.startDate,
      end_date:      data.endDate,
      same_time:     data.sameTime,
      start_time:    data.startTime,
      end_time:      data.endTime,
      daily_times:   Object.keys(data.dailyTimes).length > 0 ? data.dailyTimes : undefined,
      location:      data.location,
      admission:     data.admission,
      memo:          data.memo || null,
      poster_url:    data.posterUrl,
      link_instagram: data.linkInstagram || null,
      link_twitter:   data.linkTwitter || null,
      link_website:   data.linkWebsite || null,
    },
  });

  revalidatePath("/offline");
}
