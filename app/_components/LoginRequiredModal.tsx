"use client";

import Link from "next/link";

interface Props {
  onClose: () => void;
}

export default function LoginRequiredModal({ onClose }: Props) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[150]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[160] px-6 pt-6 pb-10 shadow-xl">
        <div className="w-10 h-1 rounded-full bg-stone-200 mx-auto mb-5" />
        <h3 className="text-base font-bold text-stone-800 mb-1.5">로그인이 필요해요</h3>
        <p className="text-sm text-stone-400 mb-6">이 기능은 로그인 후 이용할 수 있습니다.</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl border border-stone-200 text-sm text-stone-500 font-medium"
          >
            취소
          </button>
          <Link
            href="/login"
            className="flex-1 h-12 rounded-xl bg-point text-white text-sm font-semibold flex items-center justify-center"
          >
            로그인하기
          </Link>
        </div>
      </div>
    </>
  );
}
