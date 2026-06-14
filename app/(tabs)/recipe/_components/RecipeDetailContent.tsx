"use client";

import { useState } from "react";
import { type Recipe, CATEGORY_COLOR } from "../_data/mock";

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "currentColor"} strokeWidth={1.8} strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="shrink-0">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

interface Props {
  recipe: Recipe;
  isAdmin: boolean;
  onEditClick?: () => void;
}

export default function RecipeDetailContent({ recipe, isAdmin, onEditClick }: Props) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(recipe.likeCount);
  const [bookmarked, setBookmarked] = useState(false);
  const categoryStyle = CATEGORY_COLOR[recipe.category] ?? "bg-stone-100 text-stone-500";

  const toggleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <div className="pb-10">
      {/* 썸네일 */}
      <div className="aspect-video bg-stone-100 flex items-center justify-center text-stone-300 text-sm">
        이미지
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* 카테고리 + 제목 + 수정 */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold mb-2 ${categoryStyle}`}>
                {recipe.category}
              </span>
              <h1 className="text-lg font-bold text-stone-800 leading-snug">{recipe.title}</h1>
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
        </div>

        {/* 작성자 정보 */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-200 shrink-0 flex items-center justify-center text-sm font-bold text-stone-500">
            {recipe.author.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-800">{recipe.author.username}</p>
            <p className="text-xs text-stone-400">{recipe.createdAt}</p>
          </div>
        </div>

        {/* 조회수 / 좋아요 / 북마크 */}
        <div className="flex items-center gap-4 py-3 border-y border-stone-100">
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <EyeIcon />
            <span>조회 {recipe.viewCount.toLocaleString()}</span>
          </div>
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-red-500" : "text-stone-400"}`}
          >
            <HeartIcon filled={liked} />
            <span>{likeCount.toLocaleString()}</span>
          </button>
          <button
            onClick={() => setBookmarked((v) => !v)}
            className={`ml-auto flex items-center gap-1.5 text-xs transition-colors ${bookmarked ? "text-point" : "text-stone-400"}`}
          >
            <BookmarkIcon filled={bookmarked} />
            <span>저장</span>
          </button>
        </div>

        {/* 본문 */}
        <div>
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{recipe.content}</p>
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2 pt-1">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-stone-100 text-xs text-stone-500 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
