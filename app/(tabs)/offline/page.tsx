import { createSupabaseServerClient } from "@/lib/supabase/server";
import OfflineListView from "./_components/OfflineListView";

export default async function OfflinePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="pt-2">
      <div className="px-4 pt-4 pb-1">
        <h1 className="text-xl font-bold text-stone-800">오프라인</h1>
      </div>
      <OfflineListView isLoggedIn={!!user} />
    </div>
  );
}
