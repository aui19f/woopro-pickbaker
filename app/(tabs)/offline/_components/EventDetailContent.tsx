"use client";

import { useState } from "react";
import { formatDate, getEventStatus } from "../_data/mock";
import { toggleOfflineLike, toggleOfflineBookmark, toggleOfflineJoin } from "../_actions";
import LoginRequiredModal from "@/app/_components/LoginRequiredModal";

/* ─── Types ──────────────────────────────────── */

export type OfflineEventDetail = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  posterUrl: string | null;
  memo: string | null;
  linkInstagram: string | null;
  linkTwitter: string | null;
  linkWebsite: string | null;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  bookmarkCount: number;
  joinCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isJoined: boolean;
};

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

const TwitterXIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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

function SocialLink({ href, type, label }: { href: string; type: "website" | "instagram" | "twitter"; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-stone-50 border border-stone-100 text-stone-600 text-sm hover:bg-stone-100 transition-colors"
    >
      <span className="text-stone-500">
        {type === "website"   && <GlobeIcon />}
        {type === "instagram" && <InstagramIcon />}
        {type === "twitter"   && <TwitterXIcon />}
      </span>
      {label}
    </a>
  );
}

/* ─── EventDetailContent ─────────────────────── */

interface Props {
  event: OfflineEventDetail;
  isLoggedIn: boolean;
}

export default function EventDetailContent({ event, isLoggedIn }: Props) {
  const status = getEventStatus(event.startDate, event.endDate);

  const [liked, setLiked]               = useState(event.isLiked);
  const [likeCount, setLikeCount]       = useState(event.likeCount);
  const [joined, setJoined]             = useState(event.isJoined);
  const [joinCount, setJoinCount]       = useState(event.joinCount);
  const [bookmarked, setBookmarked]     = useState(event.isBookmarked);
  const [bookmarkCount, setBookmarkCount] = useState(event.bookmarkCount);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const guard = (action: () => void) => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    action();
  };

  const handleLike = () => guard(() => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    toggleOfflineLike(event.id);
  });
  const handleJoin = () => guard(() => {
    setJoined((v) => !v);
    setJoinCount((c) => (joined ? c - 1 : c + 1));
    toggleOfflineJoin(event.id);
  });
  const handleBookmark = () => guard(() => {
    setBookmarked((v) => !v);
    setBookmarkCount((c) => (bookmarked ? c - 1 : c + 1));
    toggleOfflineBookmark(event.id);
  });

  const statusStyles = { ongoing: "bg-emerald-50 text-emerald-600", upcoming: "bg-blue-50 text-blue-600", past: "bg-stone-100 text-stone-400" };
  const statusLabels = { ongoing: "행사중", upcoming: "행사전", past: "행사완료" };

  return (
    <div className="px-4 pb-10">
      {/* 포스터 */}
      <div className="aspect-3/4 bg-stone-100 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center text-stone-300 text-sm">
        {event.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          "포스터"
        )}
      </div>

      {/* 제목 + 상태 */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex-1">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${statusStyles[status]}`}>
            {statusLabels[status]}
          </span>
          <h1 className="text-lg font-bold text-stone-800 leading-snug">{event.title}</h1>
          {event.updatedAt !== event.createdAt && (
            <p className="text-xs text-stone-400 mt-1">수정됨 · {event.updatedAt}</p>
          )}
        </div>
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
        {(event.startTime || event.endTime) && (
          <div className="flex items-center gap-3 px-4 py-3.5">
            <ClockIcon />
            <p className="text-sm text-stone-700">{event.startTime} ~ {event.endTime}</p>
          </div>
        )}
        {event.location && (
          <button
            onClick={() => alert("지도 서비스 준비 중입니다.")}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
          >
            <MapPinIcon />
            <p className="text-sm text-stone-700 underline underline-offset-2">{event.location}</p>
          </button>
        )}
      </div>

      {/* 메모 */}
      {event.memo && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm mb-4 px-4 py-3.5">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">메모</p>
          <p className="text-sm text-stone-700 whitespace-pre-wrap">{event.memo}</p>
        </div>
      )}

      {/* 관련 링크 */}
      {(event.linkWebsite || event.linkInstagram || event.linkTwitter) && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 px-1">관련 링크</p>
          <div className="flex flex-col gap-2">
            {event.linkWebsite   && <SocialLink href={event.linkWebsite}   type="website"   label="공식 웹사이트" />}
            {event.linkInstagram && <SocialLink href={event.linkInstagram} type="instagram" label="인스타그램" />}
            {event.linkTwitter   && <SocialLink href={event.linkTwitter}   type="twitter"   label="트위터 (X)" />}
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

      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
}
