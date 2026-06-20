import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import RecipeWriteForm from "./_components/RecipeWriteForm";

export default async function WriteRecipePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <RecipeWriteForm />;
}
