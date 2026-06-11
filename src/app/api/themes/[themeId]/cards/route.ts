import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ themeId: string }> }
) {
  const { themeId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: cards, error } = await supabase
    .from("target_cards")
    .select("*")
    .eq("theme_id", themeId)
    .order("sort_order");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cards });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ themeId: string }> }
) {
  const { themeId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: theme, error: themeError } = await supabase
    .from("themes")
    .select("id, user_id")
    .eq("id", themeId)
    .eq("user_id", user.id)
    .single();

  if (themeError || !theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  const body = await request.json();

  const { data: card, error } = await supabase
    .from("target_cards")
    .insert({
      theme_id: themeId,
      word_text: body.word_text,
      image_url: body.image_url ?? null,
      cover_color: body.cover_color ?? "#6366f1",
      cover_shape: body.cover_shape ?? "circle",
      x_position: body.x_position ?? 0.5,
      y_position: body.y_position ?? 0.5,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ card }, { status: 201 });
}