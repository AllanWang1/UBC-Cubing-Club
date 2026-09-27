import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/SupabaseServer";

export async function PUT(request: Request) {
  const supabaseServer = await createSupabaseServerClient();
  const { currentPassword, newPassword } = await request.json();

  const {
    data: { user },
    error: userError,
  } = await supabaseServer.auth.getUser();

  if (userError || !user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate correctness of the new password:
  const { error: verifyError } = await supabaseServer.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 },
    );
  }

  const { error: updateError } = await supabaseServer.auth.updateUser({
    password: newPassword,
  });
  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Password updated successfully" });
}
