import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const meeting_id = searchParams.get("meeting_id");
  const attempt = searchParams.get("attempt");
  const cube_name = searchParams.get("cube_name");
  const round = searchParams.get("round");

  const { data, error } = await supabase
    .from("Scrambles")
    .select("scramble")
    .eq("meeting_id", meeting_id)
    .eq("attempt", attempt)
    .eq("cube_name", cube_name)
    .eq("round", round)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log("scramble: ", data);
  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { meeting_id, attempt, cube_name, round, scramble } =
    await request.json();

  const { data, error } = await supabase
    .from("Scrambles")
    .insert([
      {
        meeting_id,
        cube_name,
        attempt,
        round,
        scramble,
      },
    ])
    // Ensure that the inserted data was successful.
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    console.log("Inserted scramble: ", data);
    return NextResponse.json(data, { status: 201 });
  }
}
