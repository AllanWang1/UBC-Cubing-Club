import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/SupabaseServer";

export async function GET() {
  const supabaseServer = await createSupabaseServerClient();
  const { data, error } = await supabaseServer
    .from("ClubBasicInformation")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
}
