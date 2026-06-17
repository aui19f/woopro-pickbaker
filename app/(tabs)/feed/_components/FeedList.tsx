"use client";

import { type FeedPost } from "../_types";
import PostCard from "./PostCard";

interface Props {
  posts: FeedPost[];
  isLoggedIn: boolean;
}

export default function FeedList({ posts, isLoggedIn }: Props) {
  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-300 text-sm">
        아직 게시물이 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-white">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} isLoggedIn={isLoggedIn} />
      ))}
    </div>
  );
}
