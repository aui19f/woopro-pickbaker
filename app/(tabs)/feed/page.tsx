import { createSupabaseServerClient } from "@/lib/supabase/server";
import FeedList from "./_components/FeedList";

export default async function FeedPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <FeedList isLoggedIn={!!user} />;
}
