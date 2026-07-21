import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/SupabaseServer";

export async function DELETE(request: NextRequest) {
  const user_id = request.nextUrl.pathname.split("/").pop();
  if (!user_id) {
    return NextResponse.json(
      { error: "Missing UUID for access request deletion" },
      { status: 400 },
    );
  }
  const supabaseServer = await createSupabaseServerClient();
  const { data, error } = await supabaseServer
    .from("MembershipRequests")
    .delete()
    .eq("user_id", user_id)
    .select()
    .single();
  if (error) {
    console.error("Error deleting access request: ", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
}
