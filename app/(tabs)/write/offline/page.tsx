import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import OfflineWriteForm from "./_components/OfflineWriteForm";

export default async function WriteOfflinePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.user_metadata?.role !== "ADMIN") redirect("/feed");

  return <OfflineWriteForm />;
}
