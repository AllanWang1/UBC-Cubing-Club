import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const memberId = searchParams.get("memberId");

  if (!memberId) {
    return NextResponse.json(
      { error: "Member ID is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc("all_member_results", {
    member_id: memberId,
  })
  .eq("member_id", memberId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log("Member Results Data for Member ID: ", memberId, data);
  return NextResponse.json(data, { status: 200 });
}
