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

export async function DELETE(request: NextRequest) {
  const meeting_id = request.nextUrl.pathname.split("/").pop();
  const cube_name = request.nextUrl.searchParams.get("cube_name");
  const { data, error } = await supabase
    .from("Holds")
    .delete()
    .eq("meeting_id", meeting_id)
    .eq("cube_name", cube_name);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
}