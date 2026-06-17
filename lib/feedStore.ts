// Module-level store — survives client-side navigation, cleared on hard refresh
import type { Post } from "@/app/(tabs)/feed/_data/mock";

let _posts: Post[] = [];

export const feedStore = {
  add(post: Post) {
    _posts = [post, ..._posts];
  },
  getAll(): Post[] {
    return [..._posts];
  },
};
