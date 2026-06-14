import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MOCK_EVENTS } from "../../../offline/_data/mock";
import OfflineDetailModal from "../../../offline/_components/OfflineDetailModal";

export default async function OfflineDetailModalPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = MOCK_EVENTS.find((e) => e.id === eventId);
  if (!event) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.user_metadata?.role === "ADMIN";

  return <OfflineDetailModal event={event} isAdmin={isAdmin} />;
}
