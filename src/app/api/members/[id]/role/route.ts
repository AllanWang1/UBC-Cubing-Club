import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log("Fetching role for member ID:", id);
  if (!id) {
    // This case will usually not happen, as we expect this API to only be called with an ID when we
    // handle the case where there is no user logged in in the frontend.
    return NextResponse.json(
      { data: null, error: "ID parameter is required" },
      { status: 400 }
    );
  }
  const { data, error } = await supabase
    .from("Members")
    .select("role")
    .eq("id", id)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    if (!data) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    return NextResponse.json(data, { status: 200 });
  }
}
