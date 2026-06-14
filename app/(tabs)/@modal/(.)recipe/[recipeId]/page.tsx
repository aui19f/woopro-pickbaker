import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MOCK_RECIPES } from "../../../recipe/_data/mock";
import RecipeDetailModal from "../../../recipe/_components/RecipeDetailModal";

export default async function RecipeDetailModalPage({
  params,
}: {
  params: Promise<{ recipeId: string }>;
}) {
  const { recipeId } = await params;
  const recipe = MOCK_RECIPES.find((r) => r.id === recipeId);
  if (!recipe) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.user_metadata?.role === "ADMIN";

  return <RecipeDetailModal recipe={recipe} isAdmin={isAdmin} />;
}
