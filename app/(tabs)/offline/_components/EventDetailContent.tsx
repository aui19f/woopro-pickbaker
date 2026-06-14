"use client";

import { type OfflineEvent, formatDate, getEventStatus } from "../_data/mock";

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

/* ─── SocialLink ─────────────────────────────── */

function SocialLink({
  href,
  type,
  label,
}: {
  href: string;
  type: "website" | "instagram" | "facebook";
  label: string;
}) {
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

/* ─── EventDetailContent ─────────────────────── */

interface Props {
  event: OfflineEvent;
  isAdmin: boolean;
  onEditClick?: () => void;
}

export default function EventDetailContent({ event, isAdmin, onEditClick }: Props) {
  const status = getEventStatus(event.startDate, event.endDate);

  const statusStyles = {
    ongoing: "bg-emerald-50 text-emerald-600",
    upcoming: "bg-blue-50 text-blue-600",
    past: "bg-stone-100 text-stone-400",
  };

  const statusLabels = {
    ongoing: "행사중",
    upcoming: "행사전",
    past: "행사완료",
  };

  return (
    <div className="px-4 pb-10">
      {/* 포스터 */}
      <div className="aspect-[4/3] bg-stone-100 rounded-2xl flex items-center justify-center text-stone-300 text-sm mb-4 relative overflow-hidden">
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
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 px-1">관련 링크</p>
          <div className="flex flex-col gap-2">
            {event.links.website && (
              <SocialLink href={event.links.website} type="website" label="공식 웹사이트" />
            )}
            {event.links.instagram && (
              <SocialLink href={event.links.instagram} type="instagram" label="인스타그램" />
            )}
            {event.links.facebook && (
              <SocialLink href={event.links.facebook} type="facebook" label="페이스북" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
