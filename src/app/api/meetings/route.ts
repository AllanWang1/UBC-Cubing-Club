import { NextResponse } from "next/server";
import { supabase } from "../../lib/SupabaseClient";
import { Meeting } from "@/app/types/Meeting";

export async function GET() {
  const { data: Tournaments, error } = await supabase
    .from("Meetings")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // no error, we are ok
  return NextResponse.json(Tournaments, { status: 200 });
}

export async function POST(request: Request) {
  const reqBody: Meeting = await request.json();
  const { data, error } = await supabase
    .from("Meetings")
    .insert([
      {
        date: reqBody.date,
        passcode: reqBody.passcode,
        meeting_name: reqBody.meeting_name,
        description: reqBody.description,
        tournament: reqBody.tournament,
        status: reqBody.status,
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
