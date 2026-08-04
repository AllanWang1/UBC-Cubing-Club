import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/SupabaseServer";
import { Executive } from "@/app/types/Executive";

export async function GET(request: NextRequest) {
  const supabaseServer = await createSupabaseServerClient();
  const { data, error } = await supabaseServer
    .from("ClubExecutiveInformation")
    .select(
      "id, quote, avatar_path, Members(name), ClubExecutivePositions(title, start_date, end_date)",
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const executives: Executive[] = data.map((executive) => ({
    id: executive.id,
    name: executive.Members[0].name,
    quote: executive.quote,
    avatar_path: executive.avatar_path,
    positions: executive.ClubExecutivePositions
  }));

  return NextResponse.json(executives, { status: 200 });
}
