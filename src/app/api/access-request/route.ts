import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";
import { createSupabaseServerClient } from "@/app/lib/SupabaseServer";

export async function GET() {
  const { data, error } = await supabase.from("MemberRequest").select("*");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log("requests: ", data);
  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { fullName, email, faculty, WCAId, birthDate, UUID } =
    await request.json();
  if (!fullName || !email || !faculty || !birthDate || !UUID) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }
  const { data, error } = await supabase
    .from("MemberRequest")
    .insert([
      {
        user_id: UUID,
        name: fullName,
        email: email,
        faculty: faculty,
        birthdate: birthDate,
        wca_id: WCAId,
      },
    ])
    .select()
    .single();
  if (error) {
    console.error("Error inserting access request: ", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { user_id } = await request.json();
  if (!user_id) {
    return NextResponse.json(
      { error: "Missing UUID for access request deletion" },
      { status: 400 },
    );
  }
  const supabaseServer = await createSupabaseServerClient();
  const { data, error } = await supabaseServer
    .from("MemberRequest")
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
