"use client";

import { useEffect, useState } from "react";
import { MOCK_POSTS, type Post } from "../_data/mock";
import { feedStore } from "@/lib/feedStore";
import PostCard from "./PostCard";

interface Props {
  isLoggedIn: boolean;
}

export default function FeedList({ isLoggedIn }: Props) {
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  useEffect(() => {
    const local = feedStore.getAll();
    if (local.length > 0) setPosts([...local, ...MOCK_POSTS]);
  }, []);

  return (
    <div className="bg-white">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} isLoggedIn={isLoggedIn} />
      ))}
    </div>
  );
}
