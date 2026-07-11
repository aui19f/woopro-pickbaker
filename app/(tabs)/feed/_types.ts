export type FeedMedia = {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
};

export type FeedPost = {
  id: string;
  author: { username: string };
  content: string;
  media: FeedMedia[];
  tags: string[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
};

export type CommentItem = {
  id: string;
  nickname: string;
  username: string;
  content: string;
  createdAt: string;
};
