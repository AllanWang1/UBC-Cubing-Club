/**
 * This endpoint is used to fetch all the scrambles for a given meeting.
 * 
 * The returning result will be a list of objects, only containing the `cube_name` field.`
 * Currently this is for ease of identifying which cubes have been scrambled in the meeting. 
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const meeting_id = searchParams.get("meeting_id");

  if (!meeting_id) {
    return NextResponse.json(
      { error: "Meeting ID is required to fetch scrambles" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("Scrambles")
    .select("cube_name")
    .eq("meeting_id", meeting_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
