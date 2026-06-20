"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatDate, getEventStatus, type EventStatus } from "../_data/mock";
import { usePageLoading } from "@/app/_components/LoadingOverlay";
import LoginRequiredModal from "@/app/_components/LoginRequiredModal";

export type OfflineEventListItem = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  posterUrl: string | null;
};

type StatusFilter = "all" | EventStatus;

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: "전체",
  ongoing: "행사중",
  upcoming: "행사전",
  past: "행사후",
};

const STATUS_BADGE: Record<EventStatus, { label: string; className: string }> = {
  ongoing: { label: "행사중", className: "bg-emerald-50 text-emerald-600" },
  upcoming: { label: "행사전", className: "bg-blue-50 text-blue-600" },
  past: { label: "행사완료", className: "bg-stone-100 text-stone-400" },
};

/* ─── Icons ──────────────────────────────────── */

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M3 4h18M7 9h10M11 14h2" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-stone-400">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" fill="white" />
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="shrink-0 text-stone-400">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="shrink-0 text-stone-400">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "currentColor"} strokeWidth={2} strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CheckCircleIcon = ({ filled }: { filled: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "#3b82f6" : "none"} stroke={filled ? "#3b82f6" : "currentColor"} strokeWidth={2} strokeLinecap="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" stroke={filled ? "white" : "currentColor"} strokeWidth={2} />
  </svg>
);

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

/* ─── EventCard ──────────────────────────────── */

function EventCard({
  event,
  status,
  isLoggedIn,
}: {
  event: OfflineEventListItem;
  status: EventStatus;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const { setLoading } = usePageLoading();
  const badge = STATUS_BADGE[status];

  const [liked, setLiked] = useState(false);
  const [joined, setJoined] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const guard = (action: () => void) => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    action();
  };

  const handleCardClick = () => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    setLoading(true);
    router.push(`/offline/${event.id}`);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
      >
        {/* 포스터 — 3:4 세로 비율 */}
        <div className="aspect-3/4 bg-stone-100 relative overflow-hidden">
          {event.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">
              포스터
            </div>
          )}
          <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        {/* 정보 */}
        <div className="px-4 py-3 space-y-1.5">
          <p className="text-sm font-bold text-stone-800">{event.title}</p>

          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <CalendarIcon />
            <span>{formatDate(event.startDate)} ~ {formatDate(event.endDate)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <ClockIcon />
            <span>{event.startTime} ~ {event.endTime}</span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); alert("지도 서비스 준비 중입니다."); }}
            className="flex items-center gap-1.5 text-xs text-stone-500 text-left"
          >
            <MapPinIcon />
            <span className="underline underline-offset-2">{event.location}</span>
          </button>
        </div>

        {/* 액션 버튼 */}
        <div className="flex border-t border-stone-100 divide-x divide-stone-100">
          <button
            onClick={(e) => { e.stopPropagation(); guard(() => setLiked((v) => !v)); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
              liked ? "text-red-500 bg-red-50" : "text-stone-400 bg-white"
            }`}
          >
            <HeartIcon filled={liked} />
            좋아요
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); guard(() => setJoined((v) => !v)); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
              joined ? "text-blue-500 bg-blue-50" : "text-stone-400 bg-white"
            }`}
          >
            <CheckCircleIcon filled={joined} />
            참여
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); guard(() => setBookmarked((v) => !v)); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
              bookmarked ? "text-point bg-point/5" : "text-stone-400 bg-white"
            }`}
          >
            <BookmarkIcon filled={bookmarked} />
            북마크
          </button>
        </div>
      </div>

      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}
    </>
  );
}

/* ─── OfflineListView ────────────────────────── */

interface Props {
  events: OfflineEventListItem[];
  isLoggedIn: boolean;
}

export default function OfflineListView({ events, isLoggedIn }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const openFilter = () => {
    setShowFilter(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setFilterVisible(true)));
  };

  const closeFilter = () => {
    setFilterVisible(false);
    setTimeout(() => setShowFilter(false), 300);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter((event) => {
      const matchSearch =
        !q || event.title.toLowerCase().includes(q) || event.location.toLowerCase().includes(q);
      const status = getEventStatus(event.startDate, event.endDate);
      const matchStatus = statusFilter === "all" || status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="px-4 pt-4 pb-4">
      {/* 검색 */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="행사명 또는 장소로 검색"
            className="w-full h-11 pl-9 pr-4 rounded-xl bg-white border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:border-point transition-colors"
          />
        </div>
        <button
          onClick={openFilter}
          className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
            statusFilter !== "all"
              ? "border-point text-point bg-point/5"
              : "border-stone-200 text-stone-400 bg-white"
          }`}
        >
          <FilterIcon />
        </button>
      </div>

      {/* 활성 필터 배지 */}
      {statusFilter !== "all" && (
        <div className="flex gap-2 mb-3">
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-point/10 text-point text-xs font-medium">
            {STATUS_LABELS[statusFilter]}
            <button onClick={() => setStatusFilter("all")} className="ml-0.5">
              <XIcon />
            </button>
          </span>
        </div>
      )}

      {/* 목록 */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <p className="text-center text-stone-400 text-sm py-16">검색 결과가 없습니다.</p>
        ) : (
          filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              status={getEventStatus(event.startDate, event.endDate)}
              isLoggedIn={isLoggedIn}
            />
          ))
        )}
      </div>

      {/* 필터 모달 */}
      {showFilter && (
        <>
          <div
            className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${filterVisible ? "opacity-100" : "opacity-0"}`}
            onClick={closeFilter}
          />
          <div
            className={`fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl z-50 transition-transform duration-300 ${filterVisible ? "translate-y-0" : "translate-y-full"}`}
          >
            <div className="px-4 pt-5 pb-8">
              <p className="text-sm font-bold text-stone-800 mb-4">행사 상태 필터</p>
              <div className="flex gap-2 flex-wrap">
                {(["all", "ongoing", "upcoming", "past"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); closeFilter(); }}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                      statusFilter === s
                        ? "bg-point text-white border-point"
                        : "bg-white text-stone-500 border-stone-200"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
