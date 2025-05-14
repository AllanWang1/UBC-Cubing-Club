import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../lib/SupabaseClient";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop();

  const { data, error } = await supabase
    .from("Results")
    .select("*, Members(id, name)")
    .eq("meeting_id", id)
    .order("time_ms");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    console.log("Results: ", data);
    return NextResponse.json(data, { status: 200 });
  }
}
