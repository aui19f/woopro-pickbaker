"use client";

import { useEffect, useRef, useState } from "react";
import { type Post } from "../_data/mock";
import ImageSlider from "./ImageSlider";
import CommentModal from "./CommentModal";
import LoginRequiredModal from "@/app/_components/LoginRequiredModal";

/* ─── Icons ──────────────────────────────────── */

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"} stroke={filled ? "#ef4444" : "currentColor"} strokeWidth={1.8} strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const BookmarkIcon = ({ filled }: { filled: boolean }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
  </svg>
);

/* ─── PostCard ───────────────────────────────── */

export default function PostCard({ post, isLoggedIn }: { post: Post; isLoggedIn: boolean }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [bookmarked, setBookmarked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (el) setIsTruncated(el.scrollHeight > el.clientHeight);
  }, []);

  const guard = (action: () => void) => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    action();
  };

  const toggleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: post.content }).catch(() => {});
    } else {
      alert("공유 기능은 모바일 환경에서 지원됩니다.");
    }
  };

  return (
    <article className="border-b border-stone-100 bg-white">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-stone-200 shrink-0 flex items-center justify-center text-sm font-bold text-stone-500">
          {post.author.username.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-semibold text-stone-800 flex-1">{post.author.username}</span>
        <button className="text-stone-400 -mr-1">
          <DotsIcon />
        </button>
      </div>

      {/* 이미지 슬라이더 */}
      {post.media.length > 0 && <ImageSlider media={post.media} />}

      {/* 액션 버튼 */}
      <div className="flex items-center px-3 py-2">
        <button onClick={() => guard(toggleLike)} className="p-1">
          <HeartIcon filled={liked} />
        </button>
        <button onClick={() => guard(() => setShowComments(true))} className="p-1 ml-1">
          <CommentIcon />
        </button>
        <button onClick={handleShare} className="p-1 ml-1">
          <ShareIcon />
        </button>
        <button onClick={() => guard(() => setBookmarked((v) => !v))} className="p-1 ml-auto">
          <BookmarkIcon filled={bookmarked} />
        </button>
      </div>

      {/* 좋아요 수 */}
      <p className="px-4 text-sm font-semibold text-stone-800">
        좋아요 {likeCount.toLocaleString()}개
      </p>

      {/* 본문 */}
      <div className="px-4 pt-1 pb-1">
        <p
          ref={textRef}
          className={`text-sm text-stone-700 ${!expanded ? "line-clamp-4" : ""}`}
        >
          <span className="font-semibold text-stone-800 mr-1">{post.author.username}</span>
          {post.content}
        </p>
        {isTruncated && !expanded && (
          <button onClick={() => setExpanded(true)} className="text-sm text-stone-400 mt-0.5">
            더 보기
          </button>
        )}
      </div>

      {/* 태그 */}
      {post.tags && post.tags.length > 0 && (
        <div className="px-4 pb-1 flex flex-wrap gap-x-2 gap-y-0.5">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs text-point font-medium">#{tag}</span>
          ))}
        </div>
      )}

      {/* 댓글 보기 */}
      {post.commentCount > 0 && (
        <button
          onClick={() => guard(() => setShowComments(true))}
          className="px-4 py-1 text-sm text-stone-400"
        >
          댓글 {post.commentCount}개 모두 보기
        </button>
      )}

      {/* 타임스탬프 */}
      <p className="px-4 pt-0.5 pb-3 text-xs text-stone-400">{post.createdAt}</p>

      {/* 댓글 모달 */}
      {showComments && (
        <CommentModal postId={post.id} onClose={() => setShowComments(false)} />
      )}

      {/* 로그인 유도 모달 */}
      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}
    </article>
  );
}
