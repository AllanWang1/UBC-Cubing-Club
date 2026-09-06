import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";

export async function GET(request: NextRequest) {
  const member_id = request.nextUrl.pathname.split("/")[3];

  const { data, error } = await supabase
    .from("Members")
    .select("*")
    .eq("id", member_id)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
}
