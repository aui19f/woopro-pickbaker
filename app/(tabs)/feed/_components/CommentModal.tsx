"use client";

import { useEffect, useRef, useState } from "react";
import { MOCK_COMMENTS } from "../_data/mock";

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

interface Props {
  postId: string;
  onClose: () => void;
}

export default function CommentModal({ postId, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const comments = MOCK_COMMENTS[postId] ?? [];

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    setText("");
  };

  return (
    <>
      {/* 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* 바텀 시트 */}
      <div
        className={`fixed bottom-0 left-0 right-0 h-[70dvh] bg-white rounded-t-3xl z-50 flex flex-col transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
          <div className="w-8" />
          <p className="text-sm font-semibold text-stone-800">댓글</p>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-stone-400"
          >
            <XIcon />
          </button>
        </div>

        {/* 댓글 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {comments.length === 0 ? (
            <p className="text-center text-stone-400 text-sm pt-8">첫 번째 댓글을 남겨보세요.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 shrink-0 flex items-center justify-center text-xs font-bold text-stone-500">
                  {c.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-stone-800 mr-1.5">{c.username}</span>
                    <span className="text-stone-700">{c.content}</span>
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">{c.time}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 댓글 입력 */}
        <div className="border-t border-stone-100 px-4 py-3 flex items-center gap-3 pb-safe">
          <div className="w-8 h-8 rounded-full bg-stone-100 shrink-0 flex items-center justify-center text-xs font-bold text-stone-400">
            나
          </div>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="댓글 달기..."
            className="flex-1 text-sm text-stone-800 placeholder:text-stone-300 outline-none py-1"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="text-sm font-semibold text-point disabled:text-stone-300 transition-colors"
          >
            게시
          </button>
        </div>
      </div>
    </>
  );
}
