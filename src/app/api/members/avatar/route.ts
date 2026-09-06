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
  const newPath = `${user_id}/${crypto.randomUUID()}-avatar.jpg`;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }
  // now we can upload the file to the bucket
  const { error } = await supabaseServer.storage
    .from("avatars")
    .upload(newPath, file, {
      contentType: "image/jpeg",
      upsert: true,
    });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Delete any existing files for the user in the avatars bucket except for the newest one
  const { data: existingFiles, error: listError } = await supabaseServer.storage
    .from("avatars")
    .list(user_id);

  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }
  if (existingFiles) {
    const filesToDelete = existingFiles
      .map((file) => `${user_id}/${file.name}`)
      .filter((path) => path !== newPath);

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await supabaseServer.storage
        .from("avatars")
        .remove(filesToDelete);
      if (deleteError) {
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 },
        );
      }
    }
  }

  // Update the member's avatar_path in the Members table using function
  const { error: updateError } = await supabaseServer.rpc("update_my_avatar_path", {
    new_avatar_path: newPath,
  });
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Avatar uploaded successfully" },
    { status: 201 },
  );
}
