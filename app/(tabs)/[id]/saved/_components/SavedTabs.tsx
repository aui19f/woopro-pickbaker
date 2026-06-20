"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Types ──────────────────────────────────── */

export type SavedFeedPost = {
  id: string;
  thumbnailUrl: string | null;
  content: string;
};

export type SavedRecipe = {
  id: string;
  title: string;
  category: string;
  thumbnailUrl: string | null;
  likedAt?: string;
  bookmarkedAt?: string;
};

export type SavedOfflineEvent = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  posterUrl: string | null;
  status: "ongoing" | "upcoming" | "past";
  type: "joined" | "bookmarked";
};

interface Props {
  likedPosts: SavedFeedPost[];
  bookmarkedPosts: SavedFeedPost[];
  likedRecipes: SavedRecipe[];
  bookmarkedRecipes: SavedRecipe[];
  joinedEvents: SavedOfflineEvent[];
  bookmarkedEvents: SavedOfflineEvent[];
}

const TABS = ["피드", "레시피", "오프라인"] as const;
type Tab = typeof TABS[number];

/* ─── 피드 썸네일 그리드 ──────────────────────── */

function FeedGrid({ posts, emptyLabel }: { posts: SavedFeedPost[]; emptyLabel: string }) {
  if (posts.length === 0) return <p className="text-sm text-stone-400 text-center py-8">{emptyLabel}</p>;
  return (
    <div className="grid grid-cols-3 gap-0.5">
      {posts.map((p) => (
        <div key={p.id} className="aspect-square bg-stone-100 overflow-hidden">
          {p.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-stone-300 text-xs text-center px-1 line-clamp-3">{p.content}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── 레시피 카드 리스트 ─────────────────────── */

const CATEGORY_LABEL: Record<string, string> = {
  BREAD: "빵", CAKE: "케이크", COOKIE: "쿠키", PASTRY: "페이스트리",
  TART: "타르트", DONUT: "도넛", MUFFIN_SCONE: "머핀·스콘", ETC: "기타",
};

function RecipeList({ recipes, emptyLabel }: { recipes: SavedRecipe[]; emptyLabel: string }) {
  if (recipes.length === 0) return <p className="text-sm text-stone-400 text-center py-8">{emptyLabel}</p>;
  return (
    <div className="divide-y divide-stone-100">
      {recipes.map((r) => (
        <Link key={r.id} href={`/recipe/${r.id}`} className="flex items-center gap-3 py-3">
          <div className="w-14 h-14 rounded-xl bg-stone-100 shrink-0 overflow-hidden">
            {r.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.thumbnailUrl} alt={r.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
                {CATEGORY_LABEL[r.category] ?? r.category}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-800 truncate">{r.title}</p>
            <p className="text-xs text-stone-400 mt-0.5">{CATEGORY_LABEL[r.category] ?? r.category}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ─── 오프라인 이벤트 리스트 ─────────────────── */

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  ongoing:  { label: "행사중",   cls: "bg-emerald-50 text-emerald-600" },
  upcoming: { label: "행사전",   cls: "bg-blue-50 text-blue-600" },
  past:     { label: "행사완료", cls: "bg-stone-100 text-stone-400" },
};

function EventList({ events, emptyLabel }: { events: SavedOfflineEvent[]; emptyLabel: string }) {
  if (events.length === 0) return <p className="text-sm text-stone-400 text-center py-8">{emptyLabel}</p>;
  return (
    <div className="divide-y divide-stone-100">
      {events.map((e) => {
        const badge = STATUS_BADGE[e.status];
        return (
          <Link key={`${e.id}-${e.type}`} href={`/offline/${e.id}`} className="flex items-center gap-3 py-3">
            <div className="w-10 h-14 rounded-lg bg-stone-100 shrink-0 overflow-hidden">
              {e.posterUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.posterUrl} alt={e.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-stone-100" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mb-1 ${badge.cls}`}>
                {badge.label}
              </span>
              <p className="text-sm font-semibold text-stone-800 truncate">{e.title}</p>
              <p className="text-xs text-stone-400 mt-0.5">{e.startDate} ~ {e.endDate}</p>
            </div>
            <span className="text-[10px] text-stone-300 shrink-0">{e.type === "joined" ? "참여" : "북마크"}</span>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── SavedTabs ──────────────────────────────── */

export default function SavedTabs({
  likedPosts, bookmarkedPosts,
  likedRecipes, bookmarkedRecipes,
  joinedEvents, bookmarkedEvents,
}: Props) {
  const [tab, setTab] = useState<Tab>("피드");

  return (
    <div>
      {/* 탭 바 */}
      <div className="flex border-b border-stone-100 sticky top-14 bg-white z-10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === t
                ? "text-stone-800 border-b-2 border-stone-800"
                : "text-stone-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {tab === "피드" && (
          <div className="space-y-6">
            <section>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-3">좋아요한 피드</p>
              <FeedGrid posts={likedPosts} emptyLabel="좋아요한 피드가 없습니다." />
            </section>
            <section>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-3">북마크한 피드</p>
              <FeedGrid posts={bookmarkedPosts} emptyLabel="북마크한 피드가 없습니다." />
            </section>
          </div>
        )}

        {tab === "레시피" && (
          <div className="space-y-6">
            <section>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">좋아요한 레시피</p>
              <RecipeList recipes={likedRecipes} emptyLabel="좋아요한 레시피가 없습니다." />
            </section>
            <section>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">북마크한 레시피</p>
              <RecipeList recipes={bookmarkedRecipes} emptyLabel="북마크한 레시피가 없습니다." />
            </section>
          </div>
        )}

        {tab === "오프라인" && (
          <div className="space-y-6">
            <section>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">참여한 행사</p>
              <EventList events={joinedEvents} emptyLabel="참여한 오프라인 행사가 없습니다." />
            </section>
            <section>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wide mb-2">북마크한 행사</p>
              <EventList events={bookmarkedEvents} emptyLabel="북마크한 오프라인 행사가 없습니다." />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
