import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function WriteOfflinePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.user_metadata?.role !== "ADMIN") redirect("/feed");

  return (
    <div className="px-4 pt-6">
      <h1 className="text-xl font-bold text-stone-800 mb-4">오프라인 이벤트 등록</h1>
      <div className="bg-white rounded-2xl border border-stone-100 p-4 flex flex-col gap-4 shadow-sm">
        <input
          type="text"
          placeholder="이벤트 제목"
          className="w-full text-base font-semibold text-stone-800 placeholder:text-stone-300 outline-none border-b border-stone-100 pb-3"
        />
        <textarea
          placeholder="이벤트 내용을 입력하세요"
          rows={8}
          className="w-full text-sm text-stone-700 placeholder:text-stone-300 outline-none resize-none"
        />
      </div>
      <button className="mt-4 w-full h-12 rounded-2xl bg-point text-white font-semibold text-sm">
        등록하기
      </button>
    </div>
  );
}
