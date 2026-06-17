import { createSupabaseServerClient } from "@/lib/supabase/server";
import FeedWriteForm from "./_components/FeedWriteForm";

export default async function WriteFeedPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const username: string = user?.user_metadata?.username ?? "나";

  return <FeedWriteForm username={username} />;
}
