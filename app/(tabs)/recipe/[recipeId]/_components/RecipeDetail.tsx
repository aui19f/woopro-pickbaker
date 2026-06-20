"use client";

import { useMemo, useState } from "react";
import { toggleRecipeLike, toggleRecipeBookmark, addRecipeComment, deleteRecipeComment } from "../../_actions";
import LoginRequiredModal from "@/app/_components/LoginRequiredModal";

/* ─── Types ─────────────────────────────────────── */

export type RecipeComment = {
  id: string;
  content: string;
  author: { username: string };
  createdAt: string;
  isOwn: boolean;
};

export type RecipeDetailData = {
  id: string;
  title: string;
  category: string;
  servings: number;
  author: { username: string };
  createdAt: string;
  images: { url: string; order: number }[];
  ingredients: { id: string; name: string; amount: string }[];
  steps: { id: string; content: string; image_url: string | null; order: number }[];
  memo: string | null;
  link: string | null;
  likeCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  comments: RecipeComment[];
};

/* ─── Helpers ────────────────────────────────────── */

function parseLeadingNumber(raw: string): { baseNum: number; suffix: string } | null {
  const match = raw.match(/^(\d+\/\d+|\d+\.?\d*)(.*)/);
  if (!match) return null;
  const numStr = match[1];
  const baseNum = numStr.includes("/")
    ? (() => { const [a, b] = numStr.split("/").map(Number); return a / b; })()
    : parseFloat(numStr);
  return { baseNum, suffix: match[2].trim() };
}

function formatNum(n: number): string {
  if (n % 1 === 0) return n.toString();
  return (Math.round(n * 10) / 10).toString();
}

/* ─── Category ───────────────────────────────────── */

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

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/* ─── RecipeDetail ───────────────────────────────── */

export default function RecipeDetail({
  recipe,
  isLoggedIn,
  hideSteps = false,
}: {
  recipe: RecipeDetailData;
  isLoggedIn: boolean;
  hideSteps?: boolean;
}) {
  const [liked, setLiked]           = useState(recipe.isLiked);
  const [likeCount, setLikeCount]   = useState(recipe.likeCount);
  const [bookmarked, setBookmarked] = useState(recipe.isBookmarked);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [shareCopied, setShareCopied]       = useState(false);

  // 이미지 캐러셀
  const [imgIdx, setImgIdx] = useState(0);

  // 재료 비율 스케일러
  const [factor, setFactor]           = useState(1);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const parsedIngredients = useMemo(
    () => recipe.ingredients.map((ing) => ({ ...ing, parsed: parseLeadingNumber(ing.amount) })),
    [recipe.ingredients]
  );

  // 댓글
  const [commentList, setCommentList] = useState<RecipeComment[]>(recipe.comments);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  /* ── 좋아요 (로그인 필수) ── */
  const handleLike = async () => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    await toggleRecipeLike(recipe.id);
  };

  /* ── 북마크 (로그인 필수) ── */
  const handleBookmark = async () => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    setBookmarked((v) => !v);
    await toggleRecipeBookmark(recipe.id);
  };

  /* ── 공유 (누구나) ── */
  const handleShare = async () => {
    const url = `${window.location.origin}/recipe/${recipe.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: recipe.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  /* ── 댓글 등록 (로그인 필수) ── */
  const handleAddComment = async () => {
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const newComment = await addRecipeComment(recipe.id, commentText.trim());
      setCommentList((prev) => [...prev, newComment]);
      setCommentText("");
    } finally {
      setSubmittingComment(false);
    }
  };

  /* ── 댓글 삭제 ── */
  const handleDeleteComment = async (commentId: string) => {
    setCommentList((prev) => prev.filter((c) => c.id !== commentId));
    await deleteRecipeComment(commentId, recipe.id);
  };

  const categoryColor = CATEGORY_COLOR[recipe.category] ?? "bg-stone-100 text-stone-600";
  const categoryLabel = CATEGORY_LABEL[recipe.category] ?? recipe.category;

  return (
    <div className="pb-16">
      {/* ── 이미지 캐러셀 ── */}
      {recipe.images.length > 0 ? (
        <div className="relative bg-stone-900">
          <div
            className="flex snap-x snap-mandatory overflow-x-scroll"
            style={{ scrollbarWidth: "none" }}
            onScroll={(e) => {
              const el = e.currentTarget;
              setImgIdx(Math.round(el.scrollLeft / el.clientWidth));
            }}
          >
            {recipe.images.map((img, i) => (
              <div key={i} className="snap-start shrink-0 w-full aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {recipe.images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
              {recipe.images.map((_, i) => (
                <div key={i} className={`rounded-full transition-all duration-200 ${i === imgIdx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full aspect-square bg-stone-100 flex items-center justify-center text-stone-300 text-sm">
          이미지 없음
        </div>
      )}

      <div className="px-4 pt-5 space-y-5">
        {/* ── 카테고리 + 제목 ── */}
        <div>
          <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold mb-2 ${categoryColor}`}>
            {categoryLabel}
          </span>
          <h1 className="text-xl font-bold text-stone-800 leading-snug">{recipe.title}</h1>
        </div>

        {/* ── 작성자 ── */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-200 shrink-0 flex items-center justify-center text-sm font-bold text-stone-500">
            {recipe.author.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-800">{recipe.author.username}</p>
            <p className="text-xs text-stone-400">{recipe.createdAt}</p>
          </div>
        </div>

        {/* ── 액션 바: 좋아요 / 공유 / 북마크 ── */}
        <div className="flex items-center py-2 border-y border-stone-100">
          {/* 좋아요 */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors px-1 py-1 ${liked ? "text-red-500" : "text-stone-400"}`}
          >
            <HeartIcon filled={liked} />
            <span className="tabular-nums text-xs">{likeCount.toLocaleString()}</span>
          </button>

          {/* 공유 */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm text-stone-400 px-3 py-1 ml-1"
          >
            <ShareIcon />
            <span className="text-xs">{shareCopied ? "복사됨!" : "공유"}</span>
          </button>

          {/* 북마크 */}
          <button
            onClick={handleBookmark}
            className={`ml-auto px-1 py-1 transition-colors ${bookmarked ? "text-point" : "text-stone-400"}`}
          >
            <BookmarkIcon filled={bookmarked} />
          </button>
        </div>

        {/* ── 재료 ── */}
        {parsedIngredients.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-stone-800">재료</p>
              {factor !== 1 && (
                <button
                  onClick={() => { setFactor(1); setEditingId(null); }}
                  className="text-xs text-stone-400 underline underline-offset-2"
                >
                  원래대로
                </button>
              )}
            </div>

            {(factor > 2 || factor < 0.5) && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 mb-3">
                ⚠️ 2배 이상 차이가 날 경우 온도변화에 주의해주세요.
              </p>
            )}

            <div className="bg-stone-50 rounded-2xl divide-y divide-stone-100">
              {parsedIngredients.map((ing) => {
                const isEditing = editingId === ing.id;
                const numVal = ing.parsed
                  ? (isEditing ? editingValue : formatNum(ing.parsed.baseNum * factor))
                  : null;
                return (
                  <div key={ing.id} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-stone-700">{ing.name}</span>
                    <div className="flex items-center gap-1">
                      {numVal !== null ? (
                        <>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={numVal}
                            onFocus={() => {
                              setEditingId(ing.id);
                              setEditingValue(formatNum(ing.parsed!.baseNum * factor));
                            }}
                            onChange={(e) => {
                              const raw = e.target.value;
                              setEditingValue(raw);
                              const val = parseFloat(raw);
                              if (!isNaN(val) && val > 0) {
                                setFactor(val / ing.parsed!.baseNum);
                              }
                            }}
                            onBlur={() => setEditingId(null)}
                            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                            className={`w-16 text-right text-sm font-semibold tabular-nums bg-transparent outline-none border-b-2 transition-colors ${factor !== 1 ? "text-point border-point/40 focus:border-point" : "text-stone-800 border-stone-200 focus:border-stone-400"}`}
                          />
                          {ing.parsed?.suffix && (
                            <span className="text-sm text-stone-500 shrink-0">{ing.parsed.suffix}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-stone-500">{ing.amount}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 레시피 순서 ── */}
        {!hideSteps && recipe.steps.length > 0 && (
          <div>
            <p className="text-sm font-bold text-stone-800 mb-3">레시피 순서</p>
            <div className="space-y-4">
              {recipe.steps.map((step, i) => (
                <div key={step.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-point shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{step.content}</p>
                    {step.image_url && (
                      <div className="mt-2 rounded-xl overflow-hidden aspect-video bg-stone-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={step.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 메모 ── */}
        {recipe.memo && (
          <div className="bg-amber-50 rounded-2xl px-4 py-3.5">
            <p className="text-[11px] font-semibold text-amber-600 mb-1.5">메모</p>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{recipe.memo}</p>
          </div>
        )}

        {/* ── 링크 ── */}
        {recipe.link && (
          <a
            href={recipe.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-sm text-stone-600 active:bg-stone-100"
          >
            <LinkIcon />
            <span className="flex-1 truncate">{recipe.link}</span>
          </a>
        )}

        {/* ── 댓글 ── */}
        <div className="border-t border-stone-100 pt-5">
          <p className="text-sm font-bold text-stone-800 mb-4">
            댓글
            {commentList.length > 0 && (
              <span className="ml-1.5 text-stone-400 font-normal">{commentList.length}</span>
            )}
          </p>

          {isLoggedIn ? (
            <>
              {/* 입력창 */}
              <div className="flex gap-2 mb-5">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); }
                  }}
                  placeholder="댓글을 입력하세요"
                  rows={2}
                  className="flex-1 text-sm text-stone-800 placeholder:text-stone-300 bg-stone-50 rounded-xl px-3 py-2.5 outline-none resize-none border border-stone-100 focus:border-point transition-colors"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || submittingComment}
                  className="px-3 rounded-xl bg-point text-white text-xs font-bold disabled:opacity-40 transition-opacity shrink-0"
                >
                  등록
                </button>
              </div>

              {/* 댓글 목록 */}
              {commentList.length === 0 ? (
                <p className="text-center text-stone-300 text-sm py-6">아직 댓글이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {commentList.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-stone-200 shrink-0 flex items-center justify-center text-xs font-bold text-stone-500">
                        {c.author.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-stone-700">{c.author.username}</span>
                          <span className="text-[11px] text-stone-400">{c.createdAt}</span>
                          {c.isOwn && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="ml-auto text-stone-300 active:text-red-400 transition-colors"
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* 비로그인: 댓글 잠금 안내 */
            <button
              onClick={() => setShowLoginModal(true)}
              className="w-full flex items-center justify-center gap-2 py-5 rounded-2xl bg-stone-50 border border-stone-100 text-stone-400 text-sm"
            >
              <LockIcon />
              로그인 후 댓글을 확인하고 남길 수 있어요
            </button>
          )}
        </div>
      </div>

      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}
    </div>
  );
}
