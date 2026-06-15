"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

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

/* ─── Section label ─────────────────────────────── */

function Label({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-1.5">
      {children}
    </p>
  );
}

/* ─── Card wrapper ──────────────────────────────── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden ${className}`}>
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

/* ─── OfflineWriteForm ──────────────────────────── */

export default function OfflineWriteForm() {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle]       = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [openTime, setOpenTime]   = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [location, setLocation]   = useState("");
  const [admission, setAdmission] = useState("");
  const [memo, setMemo]           = useState("");
  const [links, setLinks]         = useState<SiteLink[]>([]);
  const [showLinkPicker, setShowLinkPicker] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const addLink = (type: LinkType) => {
    setLinks((prev) => [...prev, { id: Date.now().toString(), type, url: "" }]);
    setShowLinkPicker(false);
  };

  const updateLink = (id: string, url: string) =>
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, url } : l)));

  const removeLink = (id: string) =>
    setLinks((prev) => prev.filter((l) => l.id !== id));

  const handleSubmit = () => {
    // TODO: server action
    router.push("/offline");
  };

  return (
    <>
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-stone-100 flex items-center px-5 h-14 z-10">
        <button
          onClick={() => router.back()}
          className="text-sm text-stone-400 font-medium w-10"
        >
          취소
        </button>
        <p className="flex-1 text-center text-sm font-bold text-stone-800">
          오프라인 행사 등록
        </p>
        <button
          onClick={handleSubmit}
          className="text-sm text-point font-bold w-10 text-right"
        >
          등록
        </button>
      </div>

      <div className="px-4 py-4 space-y-3.5">

        {/* 포스터 이미지 */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        {imagePreview ? (
          <div className="relative w-full aspect-3/4 rounded-2xl overflow-hidden bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="포스터" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end justify-center pb-4">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="px-5 py-2 rounded-full bg-white/90 text-xs font-semibold text-stone-700 shadow-sm"
              >
                이미지 변경
              </button>
            </div>
            <button
              onClick={() => setImagePreview(null)}
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
            <span className="text-sm font-medium text-stone-300">포스터 이미지 추가</span>
          </button>
        )}

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

        {/* 일정 */}
        <Card>
          <CardRow>
            <Label>기간</Label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 min-w-0 text-sm text-stone-700 outline-none bg-stone-50 rounded-xl px-3 py-2 border border-stone-100"
              />
              <span className="text-stone-300 text-sm shrink-0">~</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 min-w-0 text-sm text-stone-700 outline-none bg-stone-50 rounded-xl px-3 py-2 border border-stone-100"
              />
            </div>
          </CardRow>
          <CardRow>
            <Label>운영 시간</Label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="flex-1 min-w-0 text-sm text-stone-700 outline-none bg-stone-50 rounded-xl px-3 py-2 border border-stone-100"
              />
              <span className="text-stone-300 text-sm shrink-0">~</span>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="flex-1 min-w-0 text-sm text-stone-700 outline-none bg-stone-50 rounded-xl px-3 py-2 border border-stone-100"
              />
            </div>
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
            <input
              type="text"
              value={admission}
              onChange={(e) => setAdmission(e.target.value)}
              placeholder="무료 또는 금액 입력 (예: ₩5,000)"
              className="w-full text-sm text-stone-800 placeholder:text-stone-300 outline-none bg-transparent"
            />
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

            <button
              onClick={() => setShowLinkPicker(true)}
              className="flex items-center gap-1.5 text-sm text-point font-semibold"
            >
              <PlusIcon />
              링크 추가
            </button>
          </CardRow>
        </Card>

        {/* 등록 버튼 */}
        <button
          onClick={handleSubmit}
          className="w-full h-13 rounded-2xl bg-point text-white font-bold text-sm shadow-sm active:opacity-90 transition-opacity"
        >
          등록하기
        </button>
      </div>

      {/* 링크 타입 선택 바텀 시트 */}
      {showLinkPicker && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowLinkPicker(false)}
          />
          <div className="fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl z-50 px-4 pt-4 pb-6 shadow-xl">
            <div className="w-10 h-1 rounded-full bg-stone-200 mx-auto mb-4" />
            <p className="text-xs text-stone-400 text-center mb-3">링크 유형을 선택하세요</p>
            <div className="flex flex-col gap-2">
              {LINK_OPTIONS.map(({ type, label }) => (
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
