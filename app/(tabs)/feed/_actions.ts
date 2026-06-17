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
