"use client";

import { useMemo, useState } from "react";
import { MOCK_RECIPES, type Recipe } from "../_data/mock";
import RecipeCard from "./RecipeCard";

const CATEGORIES = ["전체", "빵", "케이크", "쿠키", "타르트", "디저트"] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

/* ─── Icons ──────────────────────────────────── */

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

/* ─── RecipeListView ─────────────────────────── */

interface Props {
  isLoggedIn: boolean;
}

export default function RecipeListView({ isLoggedIn }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("전체");
  const [showOptions, setShowOptions] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const openOptions = () => {
    setShowOptions(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setOptionsVisible(true)));
  };

  const closeOptions = () => {
    setOptionsVisible(false);
    setTimeout(() => setShowOptions(false), 300);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MOCK_RECIPES.filter((r: Recipe) => {
      const matchCategory = category === "전체" || r.category === category;
      const matchSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [search, category]);

  return (
    <div>
      {/* 검색바 */}
      <div className="sticky top-0 bg-white border-b border-stone-100 px-4 py-2.5 flex items-center gap-2 z-20">
        {/* 옵션 버튼 */}
        <button
          onClick={openOptions}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
            category !== "전체"
              ? "border-point text-point bg-point/5"
              : "border-stone-200 text-stone-400 bg-white"
          }`}
        >
          <FilterIcon />
        </button>

        {/* 검색 인풋 */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="레시피 검색"
            className="w-full h-10 px-4 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-300 outline-none focus:border-point transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300"
            >
              <XIcon />
            </button>
          )}
        </div>

        {/* 검색 버튼 */}
        <button className="w-10 h-10 rounded-xl bg-point flex items-center justify-center shrink-0 text-white">
          <SearchIcon />
        </button>
      </div>

      {/* 활성 필터 칩 */}
      {category !== "전체" && (
        <div className="px-4 py-2 flex gap-2 border-b border-stone-100 bg-white">
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-point/10 text-point text-xs font-medium">
            {category}
            <button onClick={() => setCategory("전체")}>
              <XIcon />
            </button>
          </span>
        </div>
      )}

      {/* 레시피 목록 */}
      <div className="bg-white divide-y divide-stone-100">
        {filtered.length === 0 ? (
          <p className="text-center text-stone-400 text-sm py-16">검색 결과가 없습니다.</p>
        ) : (
          filtered.map((r) => <RecipeCard key={r.id} recipe={r} isLoggedIn={isLoggedIn} />)
        )}
      </div>

      {/* 옵션 모달 — 위에서 아래로 */}
      {showOptions && (
        <>
          {/* 배경 오버레이 */}
          <div
            className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${optionsVisible ? "opacity-100" : "opacity-0"}`}
            onClick={closeOptions}
          />

          {/* 패널 */}
          <div
            className={`fixed top-0 left-0 right-0 bg-white rounded-b-2xl shadow-lg z-50 transition-transform duration-300 ${optionsVisible ? "translate-y-0" : "-translate-y-full"}`}
          >
            {/* 상단 여백 (상태바 영역) */}
            <div className="h-safe-top" />

            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
              <p className="text-[16px] font-bold text-stone-800">검색 옵션</p>
              <button
                onClick={closeOptions}
                className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <CloseIcon />
              </button>
            </div>

            {/* 카테고리 */}
            <div className="px-4 pb-6">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">카테고리</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); closeOptions(); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      category === cat
                        ? "bg-point text-white border-point"
                        : "bg-white text-stone-500 border-stone-200"
                    }`}
                  >
                    {cat}
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
