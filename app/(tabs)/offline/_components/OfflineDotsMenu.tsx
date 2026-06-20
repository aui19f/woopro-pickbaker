"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { softDeleteOfflineEvent } from "../_actions";

const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </svg>
);

export default function OfflineDotsMenu({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleDelete = async () => {
    if (!confirm("삭제하시겠습니까?")) return;
    setDeleting(true);
    await softDeleteOfflineEvent(eventId);
  };

  const handleEdit = () => {
    setOpen(false);
    router.push(`/write/offline?edit=${eventId}`);
  };

  return (
    <div ref={menuRef} className="relative w-9">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
      >
        <DotsIcon />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-28 bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden z-50">
          <button
            onClick={handleEdit}
            className="w-full px-4 py-3 text-sm text-stone-700 text-left hover:bg-stone-50 transition-colors"
          >
            수정
          </button>
          <div className="h-px bg-stone-100" />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full px-4 py-3 text-sm text-red-500 text-left hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      )}
    </div>
  );
}
