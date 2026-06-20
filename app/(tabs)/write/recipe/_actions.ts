"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RecipeCategory } from "@/generated/prisma";

interface RecipeImageInput {
  url: string;
  order: number;
}

interface RecipeIngredientInput {
  name: string;
  amount: string;
  order: number;
}

interface RecipeStepInput {
  content: string;
  imageUrl?: string;
  order: number;
}

export async function createRecipe({
  title,
  category,
  memo,
  link,
  images,
  ingredients,
  steps,
}: {
  title: string;
  category: string;
  memo: string;
  link: string;
  images: RecipeImageInput[];
  ingredients: RecipeIngredientInput[];
  steps: RecipeStepInput[];
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({ where: { auth_id: user.id } });
  if (!dbUser) throw new Error("User not found");

  await prisma.recipe.create({
    data: {
      author_id: dbUser.id,
      title,
      category: category as RecipeCategory,
      memo: memo || null,
      link: link || null,
      images: {
        create: images.map((img) => ({ url: img.url, order: img.order })),
      },
      ingredients: {
        create: ingredients
          .filter((ing) => ing.name.trim())
          .map((ing) => ({ name: ing.name, amount: ing.amount, order: ing.order })),
      },
      steps: {
        create: steps
          .filter((s) => s.content.trim())
          .map((s) => ({ content: s.content, image_url: s.imageUrl ?? null, order: s.order })),
      },
    },
  });

  revalidatePath("/recipe");
}
