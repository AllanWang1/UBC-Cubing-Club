import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../lib/SupabaseClient";
import { Hold } from "@/app/types/Hold";

export async function POST(request: NextRequest) {
  const reqBody: Hold = await request.json();

  const { data, error } = await supabase
    .from("Holds")
    .insert([
      {
        meeting_id: reqBody.meeting_id,
        cube_name: reqBody.cube_name,
        format: reqBody.format,
        rounds: reqBody.rounds,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
