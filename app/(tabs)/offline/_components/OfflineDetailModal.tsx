"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EventDetailContent from "./EventDetailContent";
import { type OfflineEvent } from "../_data/mock";

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

interface Props {
  event: OfflineEvent;
  isAdmin: boolean;
}

export default function OfflineDetailModal({ event, isAdmin }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => router.back(), 280);
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* 바텀 시트 */}
      <div
        className={`fixed bottom-0 left-0 right-0 h-[90dvh] bg-base rounded-t-3xl z-50 overflow-y-auto transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* 상단 바 */}
        <div className="sticky top-0 bg-base flex items-center justify-between px-4 py-3 z-10">
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
          >
            <XIcon />
          </button>
          <p className="text-sm font-semibold text-stone-800 truncate mx-3 flex-1 text-center">
            {event.title}
          </p>
          <div className="w-9" />
        </div>

        <EventDetailContent
          event={event}
          isAdmin={isAdmin}
          onEditClick={() => router.push(`/write/offline?id=${event.id}`)}
        />
      </div>
    </>
  );
}
