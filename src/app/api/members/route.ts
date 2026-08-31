import { NextResponse, NextRequest } from "next/server";
import { supabase } from "../../lib/SupabaseClient";
import { createSupabaseServerClient } from "@/app/lib/SupabaseServer";

export async function GET(request: NextRequest) {
  // Allow a search param to be provided, filter by the search param at the end
  const user_id = request.nextUrl.searchParams.get("user_id");

  const { data, error } = await supabase
    .from("Members")
    .select("*")
    .order("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else if (user_id) {
    return NextResponse.json(
      data.filter((member) => member.user_id === user_id),
      { status: 200 },
    );
  } else {
    return NextResponse.json(data, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const { user_id, name, email, faculty, birthdate, wca_id } =
    await request.json();
  if (!user_id || !name || !faculty) {
    console.log("missing: ", { user_id, name, faculty });
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const supabaseServer = await createSupabaseServerClient();
  const { data, error } = await supabaseServer
    .from("Members")
    .insert([
      {
        user_id: user_id,
        name: name,
        email: email,
        membership: true,
        role: null,
        faculty: faculty,
        birthdate: birthdate,
        wca_id: wca_id,
      },
    ])
    .select()
    .single();
  if (error) {
    console.error("Error inserting member: ", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  console.log("Inserted member: ", data);
  return NextResponse.json(data, { status: 201 });
}
