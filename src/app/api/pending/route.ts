import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";
// import { useSearchParams } from "next/navigation";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const attempt = Number(searchParams.get("attempt"));
  const cube_name = searchParams.get("cube_name");
  const id = Number(searchParams.get("id"));
  const meeting_id = Number(searchParams.get("meeting_id"));
  const round = Number(searchParams.get("round"));

  if (!meeting_id) {
    return NextResponse.json(
      { error: "Missing meeting_id parameter" },
      { status: 400 }
    );
  }

  let qurey = supabase
    .from("PendingResults")
    .select("*, Members(id, name)")
    .eq("meeting_id", meeting_id);

  const checkingSpecificAttempt = attempt !== null && cube_name !== null && id !== null && round !== null;

  if (checkingSpecificAttempt) {
    qurey = qurey
      .eq("attempt", attempt)
      .eq("cube_name", cube_name)
      .eq("id", id)
      .eq("round", round);
  }

  const { data, error } = await qurey;

  if (error) {
    console.error("Error fetching pending results: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log("Pending result: ", data);
  return NextResponse.json(data, { status: 200 });
}


export async function POST(request: NextRequest) {
    const body = await request.json();

    const { attempt, cube_name, id, meeting_id, round, time_ms, penalty, raw_time_ms } = body;
    const record = false;
    const average_record = false;

    // Check if the result already exists
    const { data: existingResult, error: fetchError } = await supabase
        .from("PendingResults")
        .select("*")
        .eq("meeting_id", meeting_id)
        .eq("cube_name", cube_name)
        .eq("attempt", attempt)
        .eq("round", round)
        .eq("id", id)
        .neq("time_ms", -3);
    
    if (fetchError) {
        console.error("Error fetching existing result: ", fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    if (existingResult.length > 0) {
        return NextResponse.json(
        { message: "Result already exists" },
        { status: 409 }
        );
    }
    
    // Insert the new result
    const { data, error } = await supabase
        .from("PendingResults")
        .insert([
        {
            attempt,
            cube_name,
            id,
            meeting_id,
            round,
            time_ms,
            record,
            average_record,
            penalty,
            raw_time_ms,
        },
        ]);
    
    if (error) {
        console.error("Error inserting pending result: ", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
}
