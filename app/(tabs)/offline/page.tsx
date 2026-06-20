import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import OfflineListView, { type OfflineEventListItem } from "./_components/OfflineListView";

export default async function OfflinePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const rows = await prisma.offlineEvent.findMany({
    where: { status: { not: "deleted" } },
    orderBy: { created_at: "desc" },
    take: 100,
    select: {
      id:         true,
      title:      true,
      start_date: true,
      end_date:   true,
      start_time: true,
      end_time:   true,
      location:   true,
      poster_url: true,
    },
  });

  const events: OfflineEventListItem[] = rows.map((r) => ({
    id:        r.id,
    title:     r.title,
    startDate: r.start_date,
    endDate:   r.end_date,
    startTime: r.start_time,
    endTime:   r.end_time,
    location:  r.location,
    posterUrl: r.poster_url,
  }));

  return (
    <div className="pt-2">
      <div className="px-4 pt-4 pb-1">
        <h1 className="text-xl font-bold text-stone-800">오프라인</h1>
      </div>
      <OfflineListView events={events} isLoggedIn={!!user} />
    </div>
  );
}
