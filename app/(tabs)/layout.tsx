import { createSupabaseServerClient } from "@/lib/supabase/server";
import BottomNav from "@/app/_components/BottomNav";

export default async function TabsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const username = user?.user_metadata?.username as string | undefined;
  const role = user?.user_metadata?.role as string | undefined;

  return (
    <div className="flex flex-col h-dvh bg-base">
      <main className="flex-1 overflow-y-auto pb-16">{children}</main>
      {modal}
      <BottomNav userId={username} role={role} />
    </div>
  );
}
