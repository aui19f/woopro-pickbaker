"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ─────────────────────────────────────── */

interface MediaItem {
  id: string;
  preview: string;
  type: "image" | "video";
}

/* ─── Validation ─────────────────────────────────── */

function validateVideoDuration(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration <= 180);
    };
    video.onerror = () => resolve(false);
    video.src = URL.createObjectURL(file);
  });
}

/* ─── Icons ─────────────────────────────────────── */

const UploadMediaIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
    <path d="M16 5v6M13 8h6" strokeWidth={1.8} />
  </svg>
);

const PlusCircleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const XSmIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const VideoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

/* ─── FeedWriteForm ──────────────────────────────── */

export default function FeedWriteForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* 미디어 추가 */
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    const remaining = 10 - media.length;
    const toAdd = files.slice(0, remaining);

    const newItems: MediaItem[] = [];
    for (const file of toAdd) {
      const isVideo = file.type.startsWith("video/");
      if (isVideo) {
        const valid = await validateVideoDuration(file);
        if (!valid) {
          setError("영상은 최대 3분까지 업로드할 수 있습니다.");
          setTimeout(() => setError(null), 3000);
          continue;
        }
      }
      newItems.push({
        id: `${Date.now()}-${Math.random()}`,
        preview: URL.createObjectURL(file),
        type: isVideo ? "video" : "image",
      });
    }

    setMedia((prev) => [...prev, ...newItems]);
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const next = prev.filter((m) => m.id !== id);
      if (currentIdx >= next.length) setCurrentIdx(Math.max(0, next.length - 1));
      return next;
    });
  };

  /* 캐러셀 스크롤 감지 */
  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    setCurrentIdx(Math.round(el.scrollLeft / el.clientWidth));
  };

  /* 태그 입력 */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === " ") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#+/, "");
      if (tag && !tags.includes(tag) && tags.length < 20) {
        setTags((prev) => [...prev, tag]);
      }
      setTagInput("");
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  /* 업로드 */
  const handleUpload = async () => {
    setShowConfirm(false);
    setUploading(true);
    // TODO: 실제 서버 업로드
    await new Promise((res) => setTimeout(res, 2000));
    router.push("/feed");
  };

  /* 슬라이드 총 개수 (미디어 + "추가" 슬라이드) */
  const hasAddSlide = media.length < 10;
  const totalSlides = media.length + (hasAddSlide ? 1 : 0);
  const isOnMediaSlide = currentIdx < media.length;

  return (
    <>
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-stone-100 flex items-center px-5 h-14 z-10">
        <button onClick={() => router.back()} className="text-sm text-stone-400 font-medium w-10">
          취소
        </button>
        <p className="flex-1 text-center text-sm font-bold text-stone-800">피드 글쓰기</p>
        <button
          onClick={() => setShowConfirm(true)}
          className="text-sm text-point font-bold w-14 text-right"
        >
          업로드
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-3.5">

        {/* ── 미디어 업로드 ── */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFilesChange}
        />

        {media.length === 0 ? (
          /* 빈 상태 */
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-3 text-stone-300 active:bg-stone-100 transition-colors"
          >
            <UploadMediaIcon />
            <span className="text-sm font-medium">이미지 / 영상 추가</span>
            <span className="text-xs">최대 10개 · 영상 최대 3분</span>
          </button>
        ) : (
          /* 캐러셀 */
          <div className="relative rounded-2xl overflow-hidden bg-stone-900">
            {/* 슬라이드 */}
            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory overflow-x-scroll"
              style={{ scrollbarWidth: "none" }}
              onScroll={handleCarouselScroll}
            >
              {media.map((item) => (
                <div key={item.id} className="snap-start shrink-0 w-full aspect-square relative">
                  {item.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <video
                      src={item.preview}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                  )}
                  {/* 삭제 */}
                  <button
                    onClick={() => removeMedia(item.id)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white"
                  >
                    <XSmIcon />
                  </button>
                  {/* 동영상 뱃지 */}
                  {item.type === "video" && (
                    <div className="absolute bottom-10 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium">
                      <VideoIcon />
                      동영상
                    </div>
                  )}
                </div>
              ))}

              {/* 추가 슬라이드 */}
              {hasAddSlide && (
                <div className="snap-start shrink-0 w-full aspect-square bg-stone-800 flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 text-stone-400"
                  >
                    <PlusCircleIcon />
                    <span className="text-xs font-medium">{media.length} / 10</span>
                  </button>
                </div>
              )}
            </div>

            {/* 카운터 (미디어 슬라이드에서만) */}
            {isOnMediaSlide && (
              <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/40 text-white text-xs font-semibold tabular-nums">
                {currentIdx + 1} / {media.length}
              </div>
            )}

            {/* 점 인디케이터 */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1.5">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <div
                  key={idx}
                  className={`rounded-full transition-all duration-200 ${
                    idx === currentIdx
                      ? "w-4 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100">
            <p className="text-xs text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* ── 글 작성 ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
          <div className="px-4 pt-4 pb-2">
            <textarea
              value={content}
              onChange={(e) => {
                if (e.target.value.length <= 1000) setContent(e.target.value);
              }}
              placeholder="내용을 작성해주세요 (선택)"
              rows={6}
              className="w-full text-sm text-stone-800 placeholder:text-stone-300 outline-none bg-transparent resize-none"
            />
          </div>
          <div className="px-4 pb-3 flex justify-end">
            <span
              className={`text-[11px] tabular-nums ${
                content.length >= 900 ? "text-red-400" : "text-stone-300"
              }`}
            >
              {content.length} / 1000
            </span>
          </div>
        </div>

        {/* ── 태그 ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3.5">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-2.5">
            태그
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-xs font-medium text-stone-600 active:bg-stone-200 transition-colors"
                >
                  #{tag}
                  <XSmIcon />
                </button>
              ))}
            </div>
          )}

          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="태그 입력 후 스페이스 또는 엔터"
            className="w-full text-sm text-stone-700 placeholder:text-stone-300 outline-none bg-transparent"
          />
        </div>

        {/* 업로드 버튼 */}
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full h-13 rounded-2xl bg-point text-white font-bold text-sm shadow-sm active:opacity-90 transition-opacity"
        >
          업로드
        </button>
      </div>

      {/* ── 업로드 확인 모달 ── */}
      {showConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowConfirm(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 px-5 pt-6 pb-10 shadow-xl">
            <div className="w-10 h-1 rounded-full bg-stone-200 mx-auto mb-5" />
            <h3 className="text-base font-bold text-stone-800 mb-1.5">
              업로드 하시겠습니까?
            </h3>
            <p className="text-sm text-stone-400 mb-6">
              작성한 내용이 피드에 업로드됩니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-12 rounded-xl border border-stone-200 text-sm text-stone-500 font-medium"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 h-12 rounded-xl bg-point text-white text-sm font-bold"
              >
                업로드
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── 업로드 로딩 화면 ── */}
      {uploading && (
        <div className="fixed inset-0 bg-white z-[300] flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full border-[3px] border-stone-200 border-t-point animate-spin" />
          <p className="text-sm font-semibold text-stone-500">업로드 중...</p>
          <p className="text-xs text-stone-300">잠시만 기다려주세요</p>
        </div>
      )}
    </>
  );
}
