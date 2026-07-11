"use client";

import { useEffect, useRef, useState } from "react";
import { getPostComments, createComment } from "../_actions";
import type { CommentItem } from "../_types";

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

function CollapsibleContent({ content }: { content: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, []);

  return (
    <div className="text-sm text-stone-700 leading-snug">
      <span ref={ref} className={!expanded ? "line-clamp-2 block" : "block"}>
        {content}
      </span>
      {overflows && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs text-stone-400 mt-0.5"
        >
          더 보기
        </button>
      )}
    </div>
  );
}

interface Props {
  postId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export default function CommentModal({ postId, onClose, onCommentAdded }: Props) {
  const [visible, setVisible] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [currentUser, setCurrentUser] = useState<{ nickname: string; username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    getPostComments(postId).then(({ comments, currentUser }) => {
      setComments(comments);
      setCurrentUser(currentUser);
      setLoading(false);
    });
  }, [postId]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const handleSubmit = async () => {
    const content = text.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    setText("");
    await createComment(postId, content);
    const { comments: fresh } = await getPostComments(postId);
    setComments(fresh);
    setSubmitting(false);
    onCommentAdded?.();
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  };

  const initial = (str: string) => str.charAt(0).toUpperCase();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

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
          <p className="text-sm font-semibold text-stone-800">
            댓글{comments.length > 0 ? ` ${comments.length}` : ""}
          </p>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center text-stone-400">
            <XIcon />
          </button>
        </div>

        {/* 댓글 목록 */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {loading ? (
            <p className="text-center text-stone-300 text-sm pt-8">불러오는 중...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-stone-400 text-sm pt-8">첫 번째 댓글을 남겨보세요.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 shrink-0 flex items-center justify-center text-xs font-bold text-stone-500">
                  {initial(c.nickname)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5 mb-0.5">
                    <span className="text-sm font-semibold text-stone-800">{c.nickname}</span>
                    <span className="text-xs text-stone-400">@{c.username}</span>
                  </div>
                  <CollapsibleContent content={c.content} />
                  <p className="text-xs text-stone-400 mt-1">{c.createdAt}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 댓글 입력 */}
        <div className="border-t border-stone-100 px-4 py-3 flex items-center gap-3 pb-safe">
          <div className="w-8 h-8 rounded-full bg-stone-100 shrink-0 flex items-center justify-center text-xs font-bold text-stone-400">
            {currentUser ? initial(currentUser.nickname) : "?"}
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
            disabled={!text.trim() || submitting}
            className="text-sm font-semibold text-point disabled:text-stone-300 transition-colors"
          >
            {submitting ? "게시 중" : "게시"}
          </button>
        </div>
      </div>
    </>
  );
}
