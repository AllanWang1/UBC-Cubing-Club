import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/requireAdmin";

export async function PATCH(request: NextRequest) {
    const authorization = await requireAdmin();

    if(!authorization.authorized) {
        return NextResponse.json(
            { error: authorization.message },
            { status: authorization.status }
        );
    }

    const body = await request.json();

    const {
        location,
        time,
        instagram_name,
        discord_link,
        email,
        linktree_link,
    } = body;

    const { data, error } = await authorization.supabase
    .from("ClubBasicInformation")
    .update({
        location,
        time,
        instagram_name,
        discord_link,
        email,
        linktree_link,
    })
    .eq("id", 1)
    .select()
    .single();

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}