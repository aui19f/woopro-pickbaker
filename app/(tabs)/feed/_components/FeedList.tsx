"use client";

import { MOCK_POSTS } from "../_data/mock";
import PostCard from "./PostCard";

interface Props {
  isLoggedIn: boolean;
}

export default function FeedList({ isLoggedIn }: Props) {
  return (
    <div className="bg-white">
      {MOCK_POSTS.map((post) => (
        <PostCard key={post.id} post={post} isLoggedIn={isLoggedIn} />
      ))}
    </div>
  );
}
