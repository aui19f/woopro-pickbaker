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
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
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
        onClick={() => { setOpen((v) => !v); setConfirmDelete(false); }}
        className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
      >
        <DotsIcon />
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-36 bg-white rounded-2xl shadow-lg border border-stone-100 overflow-hidden z-50">
          <button
            onClick={handleEdit}
            className="w-full px-4 py-3 text-sm text-stone-700 text-left hover:bg-stone-50 transition-colors"
          >
            수정
          </button>
          <div className="h-px bg-stone-100" />
          {confirmDelete ? (
            <div className="px-4 py-3">
              <p className="text-xs text-stone-500 mb-2">정말 삭제할까요?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-1.5 rounded-lg bg-stone-100 text-xs text-stone-600 font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-1.5 rounded-lg bg-red-500 text-xs text-white font-medium disabled:opacity-50"
                >
                  {deleting ? "삭제 중" : "삭제"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              className="w-full px-4 py-3 text-sm text-red-500 text-left hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          )}
        </div>
      )}
    </div>
  );
}
