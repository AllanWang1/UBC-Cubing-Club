import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";

export async function GET() {
  const { data, error } = await supabase.from("MemberRequest").select("*");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log("requests: ", data);
  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { fullName, email, studentId, faculty, WCAId, birthDate, UUID } =
    await request.json();
  if (!fullName || !email || !faculty || !birthDate || !UUID) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
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
        student_id: studentId,
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
