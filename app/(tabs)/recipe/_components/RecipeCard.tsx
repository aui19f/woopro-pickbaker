"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type RecipeListItem } from "./RecipeListView";
import { usePageLoading } from "@/app/_components/LoadingOverlay";
import LoginRequiredModal from "@/app/_components/LoginRequiredModal";

/* ─── Category styles ────────────────────────────── */

const CATEGORY_LABEL: Record<string, string> = {
  BREAD: "빵", CAKE: "케이크", COOKIE: "쿠키·구움과자",
  PASTRY: "페이스트리", TART: "타르트", DONUT: "도넛",
  MUFFIN_SCONE: "머핀·스콘", ETC: "기타",
};

const CATEGORY_COLOR: Record<string, string> = {
  BREAD: "bg-amber-100 text-amber-700",
  CAKE: "bg-pink-100 text-pink-600",
  COOKIE: "bg-orange-100 text-orange-600",
  PASTRY: "bg-yellow-100 text-yellow-700",
  TART: "bg-rose-100 text-rose-600",
  DONUT: "bg-red-100 text-red-600",
  MUFFIN_SCONE: "bg-stone-100 text-stone-600",
  ETC: "bg-purple-100 text-purple-600",
};

/* ─── Icons ─────────────────────────────────────── */

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

/* ─── RecipeCard ─────────────────────────────────── */

interface Props {
  recipe: RecipeListItem;
  isLoggedIn: boolean;
}

export default function RecipeCard({ recipe, isLoggedIn }: Props) {
  const router = useRouter();
  const { setLoading } = usePageLoading();
  const [bookmarked, setBookmarked] = useState(recipe.isBookmarked);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const categoryStyle = CATEGORY_COLOR[recipe.category] ?? "bg-stone-100 text-stone-500";
  const categoryLabel = CATEGORY_LABEL[recipe.category] ?? recipe.category;

  const handleCardClick = () => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    setLoading(true);
    router.push(`/recipe/${recipe.id}`);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    setBookmarked((v) => !v);
  };

  return (
    <>
      <div onClick={handleCardClick} className="cursor-pointer active:opacity-90 transition-opacity">
        {/* 썸네일 */}
        <div className="relative aspect-video bg-stone-100 overflow-hidden">
          {recipe.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">
              이미지 없음
            </div>
          )}
          <span className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-xs font-semibold ${categoryStyle}`}>
            {categoryLabel}
          </span>
        </div>

        {/* 정보 */}
        <div className="px-4 pt-3 pb-4 space-y-1.5">
          <h3 className="text-sm font-bold text-stone-800 line-clamp-2 leading-snug">
            {recipe.title}
          </h3>
          {recipe.preview && (
            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
              {recipe.preview}
            </p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <span className="font-medium text-stone-500">{recipe.author.username}</span>
            <span>·</span>
            <span>{recipe.createdAt}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-stone-400">
            <HeartIcon />
            <span className="ml-0.5">{recipe.likeCount.toLocaleString()}</span>
            <button
              onClick={handleBookmark}
              className={`ml-auto transition-colors ${bookmarked ? "text-point" : "text-stone-300"}`}
            >
              <BookmarkIcon filled={bookmarked} />
            </button>
          </div>
        </div>
      </div>

      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}
    </>
  );
}
