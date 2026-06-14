"use client";

import { useState } from "react";
import { type OfflineEvent, formatDate, getEventStatus, MOCK_OFFLINE_COMMENTS, type OfflineComment } from "../_data/mock";

/* ─── Icons ──────────────────────────────────── */

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-stone-400">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" fill="white" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="shrink-0 text-stone-400">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="shrink-0 text-stone-400">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "currentColor"} strokeWidth={1.8} strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CheckCircleIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#3b82f6" : "none"} stroke={filled ? "#3b82f6" : "currentColor"} strokeWidth={1.8} strokeLinecap="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" stroke={filled ? "white" : "currentColor"} strokeWidth={2} />
  </svg>
);

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

/* ─── SocialLink ─────────────────────────────── */

function SocialLink({ href, type, label }: { href: string; type: "website" | "instagram" | "facebook"; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-stone-50 border border-stone-100 text-stone-600 text-sm hover:bg-stone-100 transition-colors"
    >
      <span className="text-stone-500">
        {type === "website" && <GlobeIcon />}
        {type === "instagram" && <InstagramIcon />}
        {type === "facebook" && <FacebookIcon />}
      </span>
      {label}
    </a>
  );
}

/* ─── CommentItem ────────────────────────────── */

function CommentItem({ comment }: { comment: OfflineComment }) {
  return (
    <div className="flex gap-2.5">
      <div className="w-8 h-8 rounded-full bg-stone-200 shrink-0 flex items-center justify-center text-xs font-bold text-stone-500">
        {comment.username.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-stone-800">{comment.username}</span>
          <span className="text-[10px] text-stone-400">{comment.time}</span>
        </div>
        <p className="text-sm text-stone-700 mt-0.5">{comment.content}</p>
      </div>
    </div>
  );
}

/* ─── EventDetailContent ─────────────────────── */

interface Props {
  event: OfflineEvent;
  isAdmin: boolean;
  onEditClick?: () => void;
}

export default function EventDetailContent({ event, isAdmin, onEditClick }: Props) {
  const status = getEventStatus(event.startDate, event.endDate);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(event.likeCount);
  const [joined, setJoined] = useState(false);
  const [joinCount, setJoinCount] = useState(event.joinCount);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(event.bookmarkCount);

  const [comments, setComments] = useState<OfflineComment[]>(MOCK_OFFLINE_COMMENTS[event.id] ?? []);
  const [commentText, setCommentText] = useState("");

  const handleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };
  const handleJoin = () => {
    setJoined((v) => !v);
    setJoinCount((c) => (joined ? c - 1 : c + 1));
  };
  const handleBookmark = () => {
    setBookmarked((v) => !v);
    setBookmarkCount((c) => (bookmarked ? c - 1 : c + 1));
  };

  const submitComment = () => {
    if (!commentText.trim()) return;
    setComments((prev) => [
      { id: `new-${Date.now()}`, username: "나", content: commentText.trim(), time: "방금 전" },
      ...prev,
    ]);
    setCommentText("");
  };

  const statusStyles = { ongoing: "bg-emerald-50 text-emerald-600", upcoming: "bg-blue-50 text-blue-600", past: "bg-stone-100 text-stone-400" };
  const statusLabels = { ongoing: "행사중", upcoming: "행사전", past: "행사완료" };

  return (
    <div className="px-4 pb-10">
      {/* 포스터 — 3:4 세로 비율 */}
      <div className="aspect-3/4 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-300 text-sm mb-4 relative overflow-hidden">
        포스터
      </div>

      {/* 제목 + 상태 + 수정 */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex-1">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${statusStyles[status]}`}>
            {statusLabels[status]}
          </span>
          <h1 className="text-lg font-bold text-stone-800 leading-snug">{event.title}</h1>
        </div>
        {isAdmin && (
          <button
            onClick={onEditClick}
            className="shrink-0 w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors mt-1"
          >
            <EditIcon />
          </button>
        )}
      </div>

      {/* 상세 정보 */}
      <div className="bg-white rounded-2xl border border-stone-100 divide-y divide-stone-50 shadow-sm mb-4">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <CalendarIcon />
          <div className="text-sm text-stone-700">
            <p>{formatDate(event.startDate)}</p>
            <p className="text-stone-400 text-xs mt-0.5">~ {formatDate(event.endDate)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <ClockIcon />
          <p className="text-sm text-stone-700">{event.startTime} ~ {event.endTime}</p>
        </div>
        <button
          onClick={() => alert("지도 서비스 준비 중입니다.")}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        >
          <MapPinIcon />
          <p className="text-sm text-stone-700 underline underline-offset-2">{event.location}</p>
        </button>
      </div>

      {/* 관련 링크 */}
      {(event.links.website || event.links.instagram || event.links.facebook) && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 px-1">관련 링크</p>
          <div className="flex flex-col gap-2">
            {event.links.website && <SocialLink href={event.links.website} type="website" label="공식 웹사이트" />}
            {event.links.instagram && <SocialLink href={event.links.instagram} type="instagram" label="인스타그램" />}
            {event.links.facebook && <SocialLink href={event.links.facebook} type="facebook" label="페이스북" />}
          </div>
        </div>
      )}

      {/* 반응 버튼 */}
      <div className="flex gap-2 pt-5 border-t border-stone-100">
        <button
          onClick={handleLike}
          className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border transition-colors ${
            liked ? "border-red-200 bg-red-50 text-red-500" : "border-stone-200 bg-white text-stone-500"
          }`}
        >
          <HeartIcon filled={liked} />
          <span className="text-xs font-medium">좋아요 {likeCount.toLocaleString()}</span>
        </button>
        <button
          onClick={handleJoin}
          className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border transition-colors ${
            joined ? "border-blue-200 bg-blue-50 text-blue-500" : "border-stone-200 bg-white text-stone-500"
          }`}
        >
          <CheckCircleIcon filled={joined} />
          <span className="text-xs font-medium">참여 {joinCount.toLocaleString()}</span>
        </button>
        <button
          onClick={handleBookmark}
          className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border transition-colors ${
            bookmarked ? "border-point/30 bg-point/5 text-point" : "border-stone-200 bg-white text-stone-500"
          }`}
        >
          <BookmarkIcon filled={bookmarked} />
          <span className="text-xs font-medium">북마크 {bookmarkCount.toLocaleString()}</span>
        </button>
      </div>

      {/* 댓글 */}
      <div className="mt-6">
        <p className="text-sm font-bold text-stone-800 mb-4">댓글 {comments.length}개</p>

        {/* 댓글 목록 */}
        <div className="space-y-4 mb-5">
          {comments.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-4">첫 번째 댓글을 남겨보세요.</p>
          ) : (
            comments.map((c) => <CommentItem key={c.id} comment={c} />)
          )}
        </div>

        {/* 댓글 입력 */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-stone-50 rounded-xl px-3 py-2.5 border border-stone-100">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요..."
              rows={1}
              className="w-full text-sm text-stone-700 placeholder:text-stone-300 bg-transparent outline-none resize-none"
            />
          </div>
          <button
            onClick={submitComment}
            disabled={!commentText.trim()}
            className="h-10 px-4 rounded-xl bg-point text-white text-sm font-semibold disabled:opacity-40 shrink-0"
          >
            게시
          </button>
        </div>
      </div>
    </div>
  );
}
