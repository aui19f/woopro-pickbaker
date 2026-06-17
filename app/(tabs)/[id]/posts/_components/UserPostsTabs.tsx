"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type UserFeedPost, type UserComment } from "../page";

const TABS = ["피드", "레시피", "댓글"] as const;
type Tab = (typeof TABS)[number];

/* ─── Icons ─────────────────────────────────────── */

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const MultiMediaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth={1.5}>
    <rect x="8" y="2" width="14" height="14" rx="2" />
    <rect x="2" y="8" width="14" height="14" rx="2" fill="none" />
  </svg>
);

const VideoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

/* ─── FeedGrid ─────────────────────────────────── */

function FeedGrid({ posts }: { posts: UserFeedPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-300 text-sm">
        작성한 게시물이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-px bg-stone-100">
      {posts.map((post) => (
        <div key={post.id} className="relative aspect-square bg-stone-200 overflow-hidden">
          {post.thumbnailUrl ? (
            post.thumbnailType === "VIDEO" ? (
              <video
                src={post.thumbnailUrl}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.thumbnailUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
              텍스트
            </div>
          )}

          {/* 멀티 미디어 / 동영상 배지 */}
          {post.thumbnailType === "VIDEO" && (
            <span className="absolute top-1.5 right-1.5">
              <VideoIcon />
            </span>
          )}
          {post.mediaCount > 1 && post.thumbnailType !== "VIDEO" && (
            <span className="absolute top-1.5 right-1.5">
              <MultiMediaIcon />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── RecipePlaceholder ────────────────────────── */

function RecipePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-2 text-stone-300">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-sm">레시피 기능 준비 중입니다.</span>
    </div>
  );
}

/* ─── CommentList ──────────────────────────────── */

function CommentList({ comments }: { comments: UserComment[] }) {
  if (comments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-300 text-sm">
        작성한 댓글이 없습니다.
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-100">
      {comments.map((c) => (
        <div key={c.id} className="flex items-center gap-3 px-4 py-3">
          {/* 게시글 썸네일 */}
          <div className="w-12 h-12 rounded-lg bg-stone-100 shrink-0 overflow-hidden">
            {c.postThumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.postThumbnailUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
                글
              </div>
            )}
          </div>

          {/* 댓글 내용 */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-stone-700 line-clamp-2">{c.content}</p>
            <p className="text-xs text-stone-400 mt-0.5">{c.createdAt}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── UserPostsTabs ────────────────────────────── */

export default function UserPostsTabs({
  username,
  feedPosts,
  comments,
}: {
  username: string;
  feedPosts: UserFeedPost[];
  comments: UserComment[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("피드");

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 헤더 */}
      <div className="sticky top-0 z-20 bg-white border-b border-stone-100">
        <div className="flex items-center h-12 px-2">
          <button
            onClick={() => router.back()}
            className="p-2 text-stone-600"
            aria-label="뒤로가기"
          >
            <BackIcon />
          </button>
          <h1 className="flex-1 text-center text-base font-semibold text-stone-800 -ml-8">
            내 게시글
          </h1>
        </div>

        {/* 탭 바 */}
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab ? "text-point" : "text-stone-400"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-point rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div>
        {activeTab === "피드" && <FeedGrid posts={feedPosts} />}
        {activeTab === "레시피" && <RecipePlaceholder />}
        {activeTab === "댓글" && <CommentList comments={comments} />}
      </div>
    </div>
  );
}
