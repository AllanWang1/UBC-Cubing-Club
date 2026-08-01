import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/requireAdmin";

export async function GET(request: NextRequest) {
    const authorization = await requireAdmin();

    if (!authorization.authorized) {
        return NextResponse.json(
            { error: authorization.message },
            { status: authorization.status }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const meeting_id = searchParams.get("meeting_id");

    const { data, error } = await authorization.supabase
        .from("PendingResults")
        .select("*, Members(id, name)")
        .eq("meeting_id", meeting_id)
        .order("cube_name")
        .order("round")
        .order("id")
        .order("attempt");
        
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
}
