"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "../_actions";

/* ─── Types ─────────────────────────────────────── */

interface MediaItem {
  id: string;
  file: File;
  preview: string;
  type: "image";
}

/* ─── Commented out: video support ──────────────────────────────────
function validateVideoDuration(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => { URL.revokeObjectURL(video.src); resolve(video.duration <= 180); };
    video.onerror = () => resolve(false);
    video.src = URL.createObjectURL(file);
  });
}
─────────────────────────────────────────────────────────────────── */

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

/* ─── Commented out: VideoIcon ──────────────────────────────────
const VideoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);
─────────────────────────────────────────────────────────────────── */

/* ─── ImageEditor ────────────────────────────────────────────────── */
// Pan: single-finger drag (only when zoomed in; scale=1 lets the carousel scroll).
// Zoom: two-finger pinch or mouse wheel.
// The image always covers the 1:1 frame — translate is clamped to W*(s-1)/2.
//
// CSS: translate(x, y) scale(s) with transform-origin: center.
// Center of element moves by exactly (x, y) in screen space.
// Overflow edges: left = W/2*(1-s)+x ≤ 0  →  x ≤ W*(s-1)/2.

function ImageEditor({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mutable transform — written synchronously in event handlers, read at render.
  const tRef = useRef({ scale: 1, x: 0, y: 0 });
  const [, forceRender] = useState(0);

  const drag = useRef<{
    startX: number; startY: number;
    originX: number; originY: number;
  } | null>(null);

  const pinch = useRef<{ dist: number; startScale: number } | null>(null);

  // Clamp x/y so image always covers the container.
  function clampXY(x: number, y: number, s: number) {
    const el = containerRef.current;
    if (!el) return { x, y };
    const hw = (el.clientWidth  * (s - 1)) / 2;
    const hh = (el.clientHeight * (s - 1)) / 2;
    return {
      x: Math.max(-hw, Math.min(hw, x)),
      y: Math.max(-hh, Math.min(hh, y)),
    };
  }

  function commit(next: Partial<typeof tRef.current>) {
    Object.assign(tRef.current, next);
    forceRender((n) => n + 1);
  }

  // Touch + wheel — must be imperative to call preventDefault() on non-passive listeners.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function dist(e: TouchEvent) {
      return Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY,
      );
    }

    function onTouchStart(e: TouchEvent) {
      const t = tRef.current;
      if (e.touches.length === 1) {
        // Only capture drag when zoomed; otherwise let parent carousel scroll.
        if (t.scale > 1.01) {
          drag.current = {
            startX: e.touches[0].clientX,
            startY: e.touches[0].clientY,
            originX: t.x,
            originY: t.y,
          };
        }
        pinch.current = null;
      } else if (e.touches.length === 2) {
        drag.current = null;
        pinch.current = { dist: dist(e), startScale: t.scale };
      }
    }

    function onTouchMove(e: TouchEvent) {
      const el = containerRef.current;
      if (!el) return;
      const t = tRef.current;

      if (e.touches.length === 1 && drag.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - drag.current.startX;
        const dy = e.touches[0].clientY - drag.current.startY;
        const clamped = clampXY(drag.current.originX + dx, drag.current.originY + dy, t.scale);
        commit(clamped);
      } else if (e.touches.length === 2 && pinch.current) {
        e.preventDefault();
        const newScale = Math.max(1, Math.min(3, pinch.current.startScale * (dist(e) / pinch.current.dist)));
        const clamped = clampXY(t.x, t.y, newScale);
        commit({ scale: newScale, ...clamped });
      }
    }

    function onTouchEnd() {
      drag.current = null;
      pinch.current = null;
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const t = tRef.current;
      const newScale = Math.max(1, Math.min(3, t.scale + (e.deltaY > 0 ? -0.12 : 0.12)));
      const clamped = clampXY(t.x, t.y, newScale);
      commit({ scale: newScale, ...clamped });
    }

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });
    el.addEventListener("touchend",   onTouchEnd);
    el.addEventListener("wheel",      onWheel, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
      el.removeEventListener("touchend",   onTouchEnd);
      el.removeEventListener("wheel",      onWheel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mouse drag (desktop)
  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    const t = tRef.current;
    drag.current = { startX: e.clientX, startY: e.clientY, originX: t.x, originY: t.y };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!drag.current) return;
    const t = tRef.current;
    const clamped = clampXY(
      drag.current.originX + e.clientX - drag.current.startX,
      drag.current.originY + e.clientY - drag.current.startY,
      t.scale,
    );
    commit(clamped);
  }

  function onMouseUp() {
    drag.current = null;
  }

  const { scale, x, y } = tRef.current;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="w-full h-full object-cover pointer-events-none"
        style={{
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      />
    </div>
  );
}

/* ─── FeedWriteForm ──────────────────────────────── */

export default function FeedWriteForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carouselRef  = useRef<HTMLDivElement>(null);

  const [media, setMedia]           = useState<MediaItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [content, setContent]       = useState("");
  const [tagInput, setTagInput]     = useState("");
  const [tags, setTags]             = useState<string[]>([]);
  const [error, setError]           = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploading, setUploading]   = useState(false);

  /* 미디어 추가 — 이미지만 */
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/"),
    );
    e.target.value = "";

    const remaining = 10 - media.length;
    const newItems: MediaItem[] = files.slice(0, remaining).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      type: "image",
    }));

    setMedia((prev) => [...prev, ...newItems]);
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const next = prev.filter((m) => m.id !== id);
      if (currentIdx >= next.length) setCurrentIdx(Math.max(0, next.length - 1));
      return next;
    });
  };

  /* 캐러셀 스크롤 */
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
      if (tag && !tags.includes(tag) && tags.length < 20) setTags((prev) => [...prev, tag]);
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

    try {
      // 1. Presigned URL 발급
      const presignRes = await fetch("/api/presigned-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: media.map((_, i) => ({ name: `file-${i}.jpg` })),
        }),
      });
      if (!presignRes.ok) throw new Error("presigned URL 요청 실패");
      const { results } = await presignRes.json();

      // 2. Supabase Storage에 직접 업로드
      const mediaUrls: { url: string; type: "IMAGE"; order: number }[] = [];
      for (const [i, item] of media.entries()) {
        const blob = await fetch(item.preview).then((r) => r.blob());
        const { signedUrl, publicUrl } = results[i];
        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          body: blob,
          headers: { "Content-Type": blob.type },
        });
        if (!uploadRes.ok) throw new Error(`파일 ${i + 1} 업로드 실패`);
        mediaUrls.push({ url: publicUrl, type: "IMAGE", order: i });
      }

      // 3. DB 포스트 생성
      await createPost({ content, tags, media: mediaUrls });
      router.push("/feed");
    } catch (err) {
      setUploading(false);
      setError(err instanceof Error ? err.message : "업로드에 실패했습니다.");
      setTimeout(() => setError(null), 4000);
    }
  };

  const hasAddSlide   = media.length < 10;
  const totalSlides   = media.length + (hasAddSlide ? 1 : 0);
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

        {/* ── 미디어 업로드 (이미지만) ── */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFilesChange}
        />

        {media.length === 0 ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center gap-3 text-stone-300 active:bg-stone-100 transition-colors"
          >
            <UploadMediaIcon />
            <span className="text-sm font-medium">이미지 추가</span>
            <span className="text-xs">최대 10장</span>
          </button>
        ) : (
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
                  {/* ImageEditor: pan + zoom per image */}
                  <ImageEditor src={item.preview} />

                  {/* 삭제 버튼 (ImageEditor 위에 오버레이) */}
                  <button
                    onClick={() => removeMedia(item.id)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white z-10"
                  >
                    <XSmIcon />
                  </button>
                </div>
              ))}

              {/* 이미지 추가 슬라이드 */}
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

            {/* 카운터 */}
            {isOnMediaSlide && (
              <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/40 text-white text-xs font-semibold tabular-nums pointer-events-none">
                {currentIdx + 1} / {media.length}
              </div>
            )}

            {/* 점 인디케이터 */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1.5 pointer-events-none">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <div
                  key={idx}
                  className={`rounded-full transition-all duration-200 ${
                    idx === currentIdx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"
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
              onChange={(e) => { if (e.target.value.length <= 1000) setContent(e.target.value); }}
              placeholder="내용을 작성해주세요 (선택)"
              rows={6}
              className="w-full text-sm text-stone-800 placeholder:text-stone-300 outline-none bg-transparent resize-none"
            />
          </div>
          <div className="px-4 pb-3 flex justify-end">
            <span className={`text-[11px] tabular-nums ${content.length >= 900 ? "text-red-400" : "text-stone-300"}`}>
              {content.length} / 1000
            </span>
          </div>
        </div>

        {/* ── 태그 ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-4 py-3.5">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-2.5">태그</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-xs font-medium text-stone-600 active:bg-stone-200 transition-colors"
                >
                  #{tag} <XSmIcon />
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
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowConfirm(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 px-5 pt-6 pb-10 shadow-xl">
            <div className="w-10 h-1 rounded-full bg-stone-200 mx-auto mb-5" />
            <h3 className="text-base font-bold text-stone-800 mb-1.5">업로드 하시겠습니까?</h3>
            <p className="text-sm text-stone-400 mb-6">작성한 내용이 피드에 업로드됩니다.</p>
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

      {/* ── 업로드 로딩 ── */}
      {uploading && (
        <div className="fixed inset-0 bg-white z-300 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-full border-[3px] border-stone-200 border-t-point animate-spin" />
          <p className="text-sm font-semibold text-stone-500">업로드 중...</p>
          <p className="text-xs text-stone-300">잠시만 기다려주세요</p>
        </div>
      )}
    </>
  );
}
