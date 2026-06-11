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

  const { data: theme, error } = await supabase
    .from("themes")
    .select("*")
    .eq("id", themeId)
    .eq("user_id", user.id)
    .single();

  if (error || !theme) {
    return NextResponse.json({ error: "Theme not found" }, { status: 404 });
  }

  return NextResponse.json({ theme });
}

export async function PATCH(
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

  const body = await request.json();

  const { data: theme, error } = await supabase
    .from("themes")
    .update(body)
    .eq("id", themeId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ theme });
}

export async function DELETE(
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

  const { error } = await supabase
    .from("themes")
    .delete()
    .eq("id", themeId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}