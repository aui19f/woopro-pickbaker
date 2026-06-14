"use client";

import { MOCK_POSTS } from "../_data/mock";
import PostCard from "./PostCard";

export default function FeedList() {
  return (
    <div className="bg-white">
      {MOCK_POSTS.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
