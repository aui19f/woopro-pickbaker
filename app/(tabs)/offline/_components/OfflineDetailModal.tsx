"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EventDetailContent, { type OfflineEventDetail } from "./EventDetailContent";
import OfflineDotsMenu from "./OfflineDotsMenu";

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export default function OfflineDetailModal({ event, isOwner, isLoggedIn }: { event: OfflineEventDetail; isOwner: boolean; isLoggedIn: boolean }) {
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
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 h-[90dvh] bg-base rounded-t-3xl z-50 overflow-y-auto transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>
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
          {isOwner ? <OfflineDotsMenu eventId={event.id} /> : <div className="w-9" />}
        </div>
        <EventDetailContent event={event} isLoggedIn={isLoggedIn} />
      </div>
    </>
  );
}
