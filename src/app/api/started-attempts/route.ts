import { NextResponse, NextRequest } from "next/server";
import { supabase } from "../../lib/SupabaseClient";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const attempt = Number(searchParams.get("attempt"));
  const cube_name = searchParams.get("cube_name");
  const id = Number(searchParams.get("id"));
  const meeting_id = Number(searchParams.get("meeting_id"));
  const round = Number(searchParams.get("round"));

  const { data, error } = await supabase
    .from("StartedAttempts")
    .select("*")
    .eq("attempt", attempt)
    .eq("cube_name", cube_name)
    .eq("id", id)
    .eq("meeting_id", meeting_id)
    .eq("round", round);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { attempt, cube_name, id, meeting_id, round } = body;

  const { data: fetchedData, error: fetchedError } = await supabase
    .from("StartedAttempts")
    .select("*")
    .eq("attempt", attempt)
    .eq("cube_name", cube_name)
    .eq("id", id)
    .eq("meeting_id", meeting_id)
    .eq("round", round);

  if (fetchedError) {
    return NextResponse.json({ error: fetchedError.message }, { status: 500 });
  }
  if (fetchedData.length > 0) {
    return NextResponse.json(
      { message: "Entry already exists" },
      { status: 409 }
    );
  }
  // The insert will be valid
  const { data, error } = await supabase.from("StartedAttempts").insert([
    {
      attempt,
      cube_name,
      id,
      meeting_id,
      round,
    },
  ]);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
