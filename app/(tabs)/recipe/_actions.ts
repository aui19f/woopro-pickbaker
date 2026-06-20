"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getDbUserId() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({ where: { auth_id: user.id }, select: { id: true } });
  if (!dbUser) throw new Error("User not found");
  return dbUser.id;
}

export async function toggleRecipeLike(recipeId: string) {
  const userId = await getDbUserId();
  const existing = await prisma.recipeLike.findUnique({
    where: { recipe_id_user_id: { recipe_id: recipeId, user_id: userId } },
  });
  if (existing) {
    await prisma.recipeLike.delete({
      where: { recipe_id_user_id: { recipe_id: recipeId, user_id: userId } },
    });
  } else {
    await prisma.recipeLike.create({ data: { recipe_id: recipeId, user_id: userId } });
  }
  revalidatePath(`/recipe/${recipeId}`);
}

export async function toggleRecipeBookmark(recipeId: string) {
  const userId = await getDbUserId();
  const existing = await prisma.recipeBookmark.findUnique({
    where: { recipe_id_user_id: { recipe_id: recipeId, user_id: userId } },
  });
  if (existing) {
    await prisma.recipeBookmark.delete({
      where: { recipe_id_user_id: { recipe_id: recipeId, user_id: userId } },
    });
  } else {
    await prisma.recipeBookmark.create({ data: { recipe_id: recipeId, user_id: userId } });
  }
  revalidatePath(`/recipe/${recipeId}`);
}

export async function addRecipeComment(recipeId: string, content: string) {
  const userId = await getDbUserId();
  const comment = await prisma.recipeComment.create({
    data: { recipe_id: recipeId, author_id: userId, content },
    include: { author: { select: { username: true } } },
  });
  revalidatePath(`/recipe/${recipeId}`);
  return {
    id:        comment.id,
    content:   comment.content,
    author:    { username: comment.author.username },
    createdAt: comment.created_at.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }),
    isOwn:     true,
  };
}

export async function deleteRecipeComment(commentId: string, recipeId: string) {
  const userId = await getDbUserId();
  await prisma.recipeComment.deleteMany({
    where: { id: commentId, author_id: userId },
  });
  revalidatePath(`/recipe/${recipeId}`);
}
