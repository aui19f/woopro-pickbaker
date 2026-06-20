"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createOfflineEvent } from "../_actions";
import { updateOfflineEvent } from "../../../offline/_actions";

/* ─── Types ─────────────────────────────────────── */

type Category = "카페" | "인테리어" | "빵" | "디저트";
type LinkType = "instagram" | "twitter" | "website";

interface SiteLink {
  id: string;
  type: LinkType;
  url: string;
}

const CATEGORIES: Category[] = ["카페", "인테리어", "빵", "디저트"];

const LINK_OPTIONS: { type: LinkType; label: string }[] = [
  { type: "instagram", label: "인스타그램" },
  { type: "twitter",   label: "트위터 (X)" },
  { type: "website",   label: "공식 사이트" },
];

const DAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

/* ─── Helpers ────────────────────────────────────── */

function getDatesInRange(start: string, end: string): string[] {
  if (!start || !end || start > end) return [];
  const dates: string[] = [];
  const cur = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (cur <= last) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}일/${DAY_KO[d.getDay()]}`;
}

function nextDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function addHoursToTime(time: string, hours: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + hours * 60;
  const hh = Math.min(23, Math.floor(total / 60));
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function formatAdmission(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return parseInt(digits, 10).toLocaleString("ko-KR");
}

/* ─── Icons ─────────────────────────────────────── */

const ImagePlaceholderIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const XSmIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

const TwitterXIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

function LinkIcon({ type }: { type: LinkType }) {
  if (type === "instagram") return <span className="text-pink-500"><InstagramIcon /></span>;
  if (type === "twitter")   return <span className="text-stone-800"><TwitterXIcon /></span>;
  return <span className="text-blue-500"><GlobeIcon /></span>;
}

/* ─── Sub-components ────────────────────────────── */

function Label({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-1.5">
      {children}
    </p>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      {children}
    </div>
  );
}

function CardRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-4 py-3.5 border-b border-stone-50 last:border-none ${className}`}>
      {children}
    </div>
  );
}

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "10", "20", "30", "40", "50"];

function TimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [hh, mm] = value ? value.split(":") : ["", ""];
  const selectCls = "bg-stone-50 border border-stone-100 rounded-xl px-2 py-2 text-xs text-stone-700 outline-none appearance-none text-center";

  const setHour = (h: string) => onChange(h ? `${h}:${mm || "00"}` : "");
  const setMin  = (m: string) => onChange(hh ? `${hh}:${m}` : "");

  return (
    <div className="flex items-center gap-1">
      <select value={hh} onChange={(e) => setHour(e.target.value)} className={selectCls} style={{ width: 52 }}>
        <option value="">--</option>
        {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-stone-400 text-xs">:</span>
      <select value={mm} onChange={(e) => setMin(e.target.value)} className={selectCls} style={{ width: 52 }}>
        <option value="">--</option>
        {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  );
}

function TimeRow({
  label,
  open,
  close,
  onOpen,
  onClose,
}: {
  label?: string;
  open: string;
  close: string;
  onOpen: (v: string) => void;
  onClose: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-xs font-bold text-stone-500 w-14 shrink-0 tabular-nums">
          {label}
        </span>
      )}
      <TimePicker value={open} onChange={onOpen} />
      <span className="text-stone-300 text-xs shrink-0">~</span>
      <TimePicker value={close} onChange={onClose} />
    </div>
  );
}

/* ─── OfflineEditData ───────────────────────────── */

export type OfflineEditData = {
  id: string;
  title: string;
  category: string;
  startDate: string;
  endDate: string;
  sameTime: boolean;
  startTime: string;
  endTime: string;
  dailyTimes: Record<string, { open: string; close: string }>;
  location: string;
  admission: string;
  memo: string;
  posterUrl: string | null;
  linkInstagram: string;
  linkTwitter: string;
  linkWebsite: string;
};

function buildInitialLinks(d: OfflineEditData | null): SiteLink[] {
  if (!d) return [];
  const links: SiteLink[] = [];
  if (d.linkInstagram) links.push({ id: "ig",  type: "instagram", url: d.linkInstagram });
  if (d.linkTwitter)   links.push({ id: "tw",  type: "twitter",   url: d.linkTwitter });
  if (d.linkWebsite)   links.push({ id: "web", type: "website",   url: d.linkWebsite });
  return links;
}

/* ─── OfflineWriteForm ──────────────────────────── */

export default function OfflineWriteForm({ initialData = null }: { initialData?: OfflineEditData | null }) {
  const router = useRouter();
  const isEdit = !!initialData;
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingPosterUrl, setExistingPosterUrl] = useState<string | null>(initialData?.posterUrl ?? null);
  const [title, setTitle]       = useState(initialData?.title ?? "");
  const [category, setCategory] = useState<Category | "">(initialData?.category as Category ?? "");

  /* 기간 */
  const [startDate, setStartDate] = useState(initialData?.startDate ?? "");
  const [endDate, setEndDate]     = useState(initialData?.endDate ?? "");

  /* 운영시간 */
  const [sameTime, setSameTime]         = useState(initialData?.sameTime ?? true);
  const [unifiedOpen, setUnifiedOpen]   = useState(initialData?.startTime ?? "");
  const [unifiedClose, setUnifiedClose] = useState(initialData?.endTime ?? "");
  const [dailyTimes, setDailyTimes]     = useState<Record<string, { open: string; close: string }>>(initialData?.dailyTimes ?? {});

  const [location, setLocation]   = useState(initialData?.location ?? "");
  const [admission, setAdmission] = useState(initialData?.admission ?? "");
  const [memo, setMemo]           = useState(initialData?.memo ?? "");
  const [links, setLinks]         = useState<SiteLink[]>(() => buildInitialLinks(initialData));
  const [showLinkPicker, setShowLinkPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* 날짜 범위 */
  const datesInRange = useMemo(() => getDatesInRange(startDate, endDate), [startDate, endDate]);

  /* ─ 날짜 핸들러: 시작일 설정 시 종료일 다음날로 초기화 ─ */
  const handleStartDateChange = (v: string) => {
    setStartDate(v);
    if (v && (!endDate || endDate <= v)) {
      setEndDate(nextDay(v));
    }
  };

  /* ─ 통합 시작시간 핸들러: 종료시간이 비어있으면 +2h로 초기화 ─ */
  const handleUnifiedOpenChange = (v: string) => {
    setUnifiedOpen(v);
    if (v && !unifiedClose) {
      setUnifiedClose(addHoursToTime(v, 2));
    }
  };

  /* ─ 날짜별 시간 업데이트: open 최초 설정 시 close +2h 초기화 ─ */
  const getDaily = (date: string, field: "open" | "close") =>
    dailyTimes[date]?.[field] ?? "";

  const updateDaily = (date: string, field: "open" | "close", value: string) =>
    setDailyTimes((prev) => {
      const existing = prev[date] ?? { open: "", close: "" };
      const next = { ...existing, [field]: value };
      if (field === "open" && value && !existing.close) {
        next.close = addHoursToTime(value, 2);
      }
      return { ...prev, [date]: next };
    });

  /* 이미지 */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  /* 입장료: 숫자만, 자동 콤마 포맷 */
  const handleAdmissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdmission(formatAdmission(e.target.value));
  };

  /* 링크 */
  const addedTypes = new Set(links.map((l) => l.type));
  const availableLinkOptions = LINK_OPTIONS.filter(({ type }) => !addedTypes.has(type));
  const addLink = (type: LinkType) => {
    setLinks((prev) => [...prev, { id: Date.now().toString(), type, url: "" }]);
    setShowLinkPicker(false);
  };
  const updateLink = (id: string, url: string) =>
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, url } : l)));
  const removeLink = (id: string) =>
    setLinks((prev) => prev.filter((l) => l.id !== id));

  /* 제출 */
  const handleSubmit = async () => {
    if (!title.trim() || !category || !startDate || !endDate) return;
    setSubmitting(true);
    try {
      const admissionNum = admission
        ? parseInt(admission.replace(/[^0-9]/g, ""), 10)
        : null;

      /* 포스터 이미지 업로드 */
      let posterUrl: string | null = existingPosterUrl;
      if (imageFile) {
        const presignRes = await fetch("/api/presigned-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: [{ name: imageFile.name }] }),
        });
        if (!presignRes.ok) throw new Error("presigned URL 요청 실패");
        const { results } = await presignRes.json();
        const uploadRes = await fetch(results[0].signedUrl, {
          method: "PUT",
          body: imageFile,
          headers: { "Content-Type": imageFile.type },
        });
        if (!uploadRes.ok) throw new Error("이미지 업로드 실패");
        posterUrl = results[0].publicUrl;
      }

      const payload = {
        title: title.trim(),
        category,
        startDate,
        endDate,
        sameTime,
        startTime:  sameTime ? unifiedOpen  : "",
        endTime:    sameTime ? unifiedClose : "",
        dailyTimes: sameTime ? {} : dailyTimes,
        location,
        admission:  admissionNum,
        memo,
        posterUrl,
        linkInstagram: links.find((l) => l.type === "instagram")?.url ?? "",
        linkTwitter:   links.find((l) => l.type === "twitter")?.url ?? "",
        linkWebsite:   links.find((l) => l.type === "website")?.url ?? "",
      };

      if (isEdit && initialData) {
        await updateOfflineEvent(initialData.id, payload);
      } else {
        await createOfflineEvent(payload);
        router.push("/offline");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-stone-100 flex items-center px-5 h-14 z-10">
        <button onClick={() => router.back()} className="text-sm text-stone-400 font-medium w-10">
          취소
        </button>
        <p className="flex-1 text-center text-sm font-bold text-stone-800">{isEdit ? "오프라인 행사 수정" : "오프라인 행사 등록"}</p>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="text-sm text-point font-bold w-10 text-right disabled:opacity-40"
        >
          {isEdit ? "저장" : "등록"}
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-3.5">

        {/* 포스터 */}
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

        <div className="max-w-[320px] mx-auto">
          {(imagePreview || existingPosterUrl) ? (
            <div className="relative w-full aspect-3/4 rounded-2xl overflow-hidden bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview ?? existingPosterUrl!} alt="포스터" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent flex items-end justify-center pb-4">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="px-5 py-2 rounded-full bg-white/90 text-xs font-semibold text-stone-700 shadow-sm"
                >
                  이미지 변경
                </button>
              </div>
              <button
                onClick={() => { setImagePreview(null); setImageFile(null); setExistingPosterUrl(null); }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white"
              >
                <XSmIcon />
              </button>
            </div>
          ) : (
            <button
              onClick={() => imageInputRef.current?.click()}
              className="w-full aspect-3/4 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-3 text-stone-300 active:bg-stone-100 transition-colors"
            >
              <ImagePlaceholderIcon />
              <span className="text-sm font-medium">포스터 이미지 추가</span>
            </button>
          )}
        </div>

        {/* 기본 정보 */}
        <Card>
          <CardRow>
            <Label>제목</Label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="행사 제목을 입력하세요"
              className="w-full text-sm text-stone-800 placeholder:text-stone-300 outline-none bg-transparent"
            />
          </CardRow>
          <CardRow>
            <Label>카테고리</Label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? "" : cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    category === cat
                      ? "bg-point text-white border-point"
                      : "bg-white text-stone-400 border-stone-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </CardRow>
        </Card>

        {/* 기간 + 운영시간 */}
        <Card>
          <CardRow>
            <Label>기간</Label>
            <div className="flex items-center gap-1.5 mb-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="flex-1 min-w-0 text-sm text-stone-700 outline-none bg-stone-50 rounded-xl px-3 py-2 border border-stone-100"
              />
              <span className="text-stone-300 text-sm shrink-0">~</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 min-w-0 text-sm text-stone-700 outline-none bg-stone-50 rounded-xl px-3 py-2 border border-stone-100"
              />
            </div>

            <div className="flex items-center justify-between mb-3">
              <Label>운영시간</Label>
              <button
                onClick={() => setSameTime(!sameTime)}
                className="flex items-center gap-1.5 shrink-0 -mt-1.5"
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    sameTime ? "bg-point border-point" : "bg-white border-stone-300"
                  }`}
                >
                  {sameTime && <CheckIcon />}
                </div>
                <span className="text-xs font-medium text-stone-500">시간 모두 동일</span>
              </button>
            </div>

            {sameTime && (
              <TimeRow
                open={unifiedOpen}
                close={unifiedClose}
                onOpen={handleUnifiedOpenChange}
                onClose={setUnifiedClose}
              />
            )}

            {!sameTime && datesInRange.length > 0 && (
              <div className="space-y-2">
                {datesInRange.map((date) => (
                  <TimeRow
                    key={date}
                    label={dayLabel(date)}
                    open={getDaily(date, "open")}
                    close={getDaily(date, "close")}
                    onOpen={(v) => updateDaily(date, "open", v)}
                    onClose={(v) => updateDaily(date, "close", v)}
                  />
                ))}
              </div>
            )}

            {!sameTime && datesInRange.length === 0 && (
              <p className="text-xs text-stone-300 text-center py-2">
                날짜를 먼저 설정해주세요
              </p>
            )}
          </CardRow>
        </Card>

        {/* 장소 / 입장료 */}
        <Card>
          <CardRow>
            <Label>장소</Label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="행사 장소를 입력하세요"
              className="w-full text-sm text-stone-800 placeholder:text-stone-300 outline-none bg-transparent"
            />
          </CardRow>
          <CardRow>
            <Label>입장료</Label>
            <div className="flex items-center gap-1.5">
              {admission && <span className="text-sm text-stone-500 shrink-0">₩</span>}
              <input
                type="text"
                inputMode="numeric"
                value={admission}
                onChange={handleAdmissionChange}
                placeholder="무료면 비워두세요"
                className="flex-1 text-sm text-stone-800 placeholder:text-stone-300 outline-none bg-transparent"
              />
            </div>
          </CardRow>
        </Card>

        {/* 메모 */}
        <Card>
          <CardRow>
            <Label>메모</Label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="행사에 대한 추가 정보나 설명을 입력하세요"
              rows={5}
              className="w-full text-sm text-stone-800 placeholder:text-stone-300 outline-none bg-transparent resize-none"
            />
          </CardRow>
        </Card>

        {/* 사이트 링크 */}
        <Card>
          <CardRow>
            <Label>사이트</Label>
            {links.length > 0 && (
              <div className="space-y-2 mb-3">
                {links.map((link) => (
                  <div key={link.id} className="flex items-center gap-2.5">
                    <span className="shrink-0"><LinkIcon type={link.type} /></span>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateLink(link.id, e.target.value)}
                      placeholder="https://"
                      className="flex-1 text-sm text-stone-700 placeholder:text-stone-300 outline-none bg-stone-50 rounded-xl px-3 py-2 border border-stone-100"
                    />
                    <button
                      onClick={() => removeLink(link.id)}
                      className="shrink-0 w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 active:bg-stone-200 transition-colors"
                    >
                      <XSmIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {availableLinkOptions.length > 0 && (
              <button
                onClick={() => setShowLinkPicker(true)}
                className="flex items-center gap-1.5 text-sm text-point font-semibold"
              >
                <PlusIcon />
                링크 추가
              </button>
            )}
          </CardRow>
        </Card>

        {/* 등록 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-13 rounded-2xl bg-point text-white font-bold text-sm shadow-sm active:opacity-90 transition-opacity disabled:opacity-40"
        >
          {submitting ? (isEdit ? "저장 중..." : "등록 중...") : (isEdit ? "저장하기" : "등록하기")}
        </button>
      </div>

      {/* 링크 타입 선택 바텀 시트 */}
      {showLinkPicker && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowLinkPicker(false)} />
          <div className="fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl z-50 px-4 pt-4 pb-6 shadow-xl">
            <div className="w-10 h-1 rounded-full bg-stone-200 mx-auto mb-4" />
            <p className="text-xs text-stone-400 text-center mb-3">링크 유형을 선택하세요</p>
            <div className="flex flex-col gap-2">
              {availableLinkOptions.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => addLink(type)}
                  className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-stone-50 border border-stone-100 text-sm font-medium text-stone-700 active:bg-stone-100 transition-colors"
                >
                  <LinkIcon type={type} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
