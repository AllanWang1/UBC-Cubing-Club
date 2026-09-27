import { NextResponse, NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/SupabaseServer";

export async function PUT(request: NextRequest) {
  const supabaseServer = await createSupabaseServerClient();
  const { newPassword } = await request.json();

  const {
    data: { user },
    error: userError,
  } = await supabaseServer.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  return NextResponse.json(
    { message: "Password updated successfully" },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  const supabaseServer = await createSupabaseServerClient();
  const { email } = await request.json();

//   const redirectTo = `http://localhost:3000/signin/password-reset-submission`;
  const redirectTo = `https://speedcubingubc.vercel.app/signin/password-reset-submission`;
  const { error: resetError } = await supabaseServer.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: redirectTo,
    },
  );

  if (resetError) {
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Password reset email sent successfully",
  });
}
