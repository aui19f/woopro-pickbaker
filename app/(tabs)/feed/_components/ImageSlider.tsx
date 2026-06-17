"use client";

import { useRef, useState } from "react";
import { type PostMedia } from "../_data/mock";

export default function ImageSlider({ media }: { media: PostMedia[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setCurrentIndex(Math.round(el.scrollLeft / el.offsetWidth));
  };

  return (
    <div className="relative">
      {/* 닷 인디케이터 — 이미지 위 */}
      {media.length > 1 && (
        <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
          {media.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-5 bg-white shadow" : "w-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* 슬라이더 */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
        onScroll={handleScroll}
      >
        {media.map((item, i) => (
          <div
            key={item.id}
            className="snap-center shrink-0 w-full aspect-square bg-stone-100 overflow-hidden"
          >
            {item.preview && item.type === "video" ? (
              <video
                src={item.preview}
                className="w-full h-full object-cover"
                playsInline
                muted
                controls
              />
            ) : item.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.preview} alt={`이미지 ${i + 1}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">
                이미지 {i + 1}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
