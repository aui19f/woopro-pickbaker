import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/app/_components/LogoutButton";

const MENU_ITEMS = ["내 게시글", "북마크", "팔로잉", "알림 설정"] as const;

export default async function MyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.user.findUnique({ where: { username: id } });
  if (!profile) redirect("/feed");

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-stone-100 px-5 py-5 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-stone-100 shrink-0 flex items-center justify-center text-2xl font-bold text-stone-300">
          {profile.nickname.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-base font-bold text-stone-800">{profile.nickname}</p>
          <p className="text-xs text-stone-400 mt-0.5">@{profile.username}</p>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-stone-100 divide-y divide-stone-100 shadow-sm">
        {MENU_ITEMS.map((item) => (
          <button
            key={item}
            className="w-full flex items-center justify-between px-5 py-4 text-sm text-stone-700"
          >
            {item}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
        <LogoutButton />
      </div>
    </div>
  );
}
