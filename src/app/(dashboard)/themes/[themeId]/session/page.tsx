import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SessionCanvas } from "@/components/canvas/session-canvas";

async function getThemeWithCards(themeId: string, userId: string) {
  const supabase = await createClient();

  const { data: theme } = await supabase
    .from("themes")
    .select("*")
    .eq("id", themeId)
    .eq("user_id", userId)
    .single();

  if (!theme) return null;

  const { data: cards } = await supabase
    .from("target_cards")
    .select("*")
    .eq("theme_id", themeId)
    .order("sort_order");

  return { theme, cards: cards ?? [] };
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const { themeId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const data = await getThemeWithCards(themeId, user.id);
  if (!data) redirect("/dashboard");

  return <SessionCanvas theme={data.theme} initialCards={data.cards} />;
}