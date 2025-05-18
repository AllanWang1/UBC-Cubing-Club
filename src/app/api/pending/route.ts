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

  const { data, error } = await supabase
    .from("PendingResults")
    .select("*")
    .eq("meeting_id", meeting_id)
    .eq("cube_name", cube_name)
    .eq("attempt", attempt)
    .eq("round", round)
    .eq("id", id);

  if (error) {
    console.error("Error fetching pending results: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log("Pending result: ", data);
  return NextResponse.json(data, { status: 200 });
}
