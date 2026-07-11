"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getDbUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { auth_id: user.id } });
  if (!dbUser) throw new Error("User not found");
  return dbUser;
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  if (h < 24) return `${h}시간 전`;
  if (d < 7) return `${d}일 전`;
  return date.toLocaleDateString("ko-KR");
}

export async function getPostComments(postId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let currentUser: { nickname: string; username: string } | null = null;
  if (authUser) {
    const dbUser = await prisma.user.findUnique({
      where: { auth_id: authUser.id },
      select: { nickname: true, username: true },
    });
    if (dbUser) currentUser = dbUser;
  }

  const rows = await prisma.postComment.findMany({
    where: { post_id: postId },
    orderBy: { created_at: "asc" },
    include: { author: { select: { nickname: true, username: true } } },
  });

  return {
    currentUser,
    comments: rows.map((c) => ({
      id: c.id,
      nickname: c.author.nickname,
      username: c.author.username,
      content: c.content,
      createdAt: formatRelativeTime(c.created_at),
    })),
  };
}

export async function createComment(postId: string, content: string) {
  const dbUser = await getDbUser();
  await prisma.postComment.create({
    data: { post_id: postId, author_id: dbUser.id, content },
  });
  revalidatePath("/feed");
}

export async function toggleLike(postId: string) {
  const dbUser = await getDbUser();
  const key = { post_id: postId, user_id: dbUser.id };
  const existing = await prisma.postLike.findUnique({ where: { post_id_user_id: key } });
  if (existing) {
    await prisma.postLike.delete({ where: { post_id_user_id: key } });
  } else {
    await prisma.postLike.create({ data: key });
  }
  revalidatePath("/feed");
}

export async function toggleBookmark(postId: string) {
  const dbUser = await getDbUser();
  const key = { post_id: postId, user_id: dbUser.id };
  const existing = await prisma.postBookmark.findUnique({ where: { post_id_user_id: key } });
  if (existing) {
    await prisma.postBookmark.delete({ where: { post_id_user_id: key } });
  } else {
    await prisma.postBookmark.create({ data: key });
  }
  revalidatePath("/feed");
}
