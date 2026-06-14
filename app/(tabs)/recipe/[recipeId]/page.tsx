import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MOCK_RECIPES } from "../_data/mock";
import RecipeDetailContent from "../_components/RecipeDetailContent";

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export default async function RecipeDetailPage({
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

  return (
    <div>
      <div className="sticky top-0 bg-white flex items-center px-4 h-14 border-b border-stone-100 z-10">
        <Link
          href="/recipe"
          className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-500"
        >
          <BackIcon />
        </Link>
        <p className="flex-1 text-center text-sm font-semibold text-stone-800 truncate mx-3">
          {recipe.title}
        </p>
        <div className="w-9" />
      </div>
      <RecipeDetailContent recipe={recipe} isAdmin={isAdmin} />
    </div>
  );
}
