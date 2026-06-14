"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/(tabs)/[id]/actions";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logoutAction())}
      disabled={isPending}
      className="w-full flex items-center justify-between px-5 py-4 text-sm text-red-500 disabled:opacity-60"
    >
      {isPending ? "로그아웃 중..." : "로그아웃"}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
