import { createSupabaseServerClient } from "@/lib/supabase/server";
import RecipeListView from "./_components/RecipeListView";

export default async function RecipePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <RecipeListView isLoggedIn={!!user} />;
}
