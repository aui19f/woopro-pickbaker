import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/feed");

  return (
    <div className="min-h-[100dvh] bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-point tracking-tight">pickbaker</h1>
          <p className="text-sm text-stone-400 mt-1">베이커리 커뮤니티</p>
        </div>
        {children}
      </div>
    </div>
  );
}
