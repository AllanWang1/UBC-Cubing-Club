import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/app/lib/SupabaseClient";

export async function POST(request: NextRequest) {
  const { user_id, member_id, name } = await request.json();
  if (!user_id || !member_id || !name) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  const { data, error } = await supabase.rpc("update_user_metadata", {
    p_id: user_id,
    p_full_name: name,
    p_member_id: member_id,
  });

  if (error) {
    console.error("Error updating metadata:", error);
  } else {
    console.log("Metadata updated successfully:", data);
  }
}
