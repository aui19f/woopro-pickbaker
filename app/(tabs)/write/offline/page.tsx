import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import OfflineWriteForm, { type OfflineEditData } from "./_components/OfflineWriteForm";

export default async function WriteOfflinePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.user_metadata?.role !== "ADMIN") redirect("/feed");

  const { edit: editId } = await searchParams;

  let initialData: OfflineEditData | null = null;
  if (editId) {
    const dbUser = await prisma.user.findUnique({ where: { auth_id: user!.id }, select: { id: true } });
    if (dbUser) {
      const row = await prisma.offlineEvent.findFirst({
        where: { id: editId, author_id: dbUser.id },
      });
      if (row) {
        const dailyTimesRaw = row.daily_times as Record<string, { open: string; close: string }> | null;
        initialData = {
          id:            row.id,
          title:         row.title,
          category:      row.category,
          startDate:     row.start_date,
          endDate:       row.end_date,
          sameTime:      row.same_time,
          startTime:     row.start_time,
          endTime:       row.end_time,
          dailyTimes:    dailyTimesRaw ?? {},
          location:      row.location,
          admission:     row.admission != null ? row.admission.toLocaleString("ko-KR") : "",
          memo:          row.memo ?? "",
          posterUrl:     row.poster_url ?? null,
          linkInstagram: row.link_instagram ?? "",
          linkTwitter:   row.link_twitter ?? "",
          linkWebsite:   row.link_website ?? "",
        };
      }
    }
  }

  return <OfflineWriteForm initialData={initialData} />;
}
