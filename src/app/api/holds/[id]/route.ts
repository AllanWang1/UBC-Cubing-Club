import { NextResponse, NextRequest } from "next/server";
import { supabase } from "../../../lib/SupabaseClient";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.pathname.split("/").pop();
  const { data: Holds, error } = await supabase
    .from("Holds")
    .select(
      "meeting_id, cube_name, format, rounds, Cubes(cube_name, icon_link, order), FormatAttempts(format, max_attempts)"
    )
    .eq("meeting_id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json(Holds, { status: 200 });
  }
}
