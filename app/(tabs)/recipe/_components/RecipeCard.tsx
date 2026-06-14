"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Recipe, CATEGORY_COLOR } from "../_data/mock";

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const HeartIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="inline-block">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const EyeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="inline-block">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);
  const categoryStyle = CATEGORY_COLOR[recipe.category] ?? "bg-stone-100 text-stone-500";

  return (
    <div
      onClick={() => router.push(`/recipe/${recipe.id}`)}
      className="cursor-pointer active:opacity-90 transition-opacity"
    >
      {/* 썸네일 */}
      <div className="relative aspect-video bg-stone-100 flex items-center justify-center text-stone-300 text-sm">
        이미지
        <span className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-xs font-semibold ${categoryStyle}`}>
          {recipe.category}
        </span>
      </div>

      {/* 정보 */}
      <div className="px-4 pt-3 pb-4 space-y-1.5">
        {/* 제목 */}
        <h3 className="text-sm font-bold text-stone-800 line-clamp-2 leading-snug">
          {recipe.title}
        </h3>

        {/* 내용 미리보기 */}
        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
          {recipe.content}
        </p>

        {/* 태그 */}
        <p className="text-xs text-point line-clamp-1">
          {recipe.tags.map((t) => `#${t}`).join("  ")}
        </p>

        {/* 작성자 | 날짜 */}
        <div className="flex items-center gap-1.5 text-xs text-stone-400">
          <span className="font-medium text-stone-500">{recipe.author.username}</span>
          <span>·</span>
          <span>{recipe.createdAt}</span>
        </div>

        {/* 조회수 / 좋아요 / 북마크 */}
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <EyeIcon />
          <span className="ml-0.5">{recipe.viewCount.toLocaleString()}</span>
          <span className="mx-1.5">·</span>
          <HeartIcon />
          <span className="ml-0.5">{recipe.likeCount.toLocaleString()}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setBookmarked((v) => !v); }}
            className={`ml-auto transition-colors ${bookmarked ? "text-point" : "text-stone-300"}`}
          >
            <BookmarkIcon filled={bookmarked} />
          </button>
        </div>
      </div>
    </div>
  );
}
