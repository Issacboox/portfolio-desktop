import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/v1/health — checks the app can reach Supabase.
export async function GET() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, publishedPosts: count ?? 0 });
}
