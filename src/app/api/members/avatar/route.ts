import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/SupabaseServer";

export async function POST(request: NextRequest) {
  const supabaseServer = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // User is valid
  const user_id = user.id;
  const formData = await request.formData();
  const file = formData.get("croppedImage");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }
  // now we can upload the file to the bucket
  const { error } = await supabaseServer.storage
    .from("avatars")
    .upload(`${user_id}/${crypto.randomUUID()}-avatar.jpg`, file, {
      contentType: "image/jpeg",
      upsert: true,
    });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ status: 201 });
  }
}
