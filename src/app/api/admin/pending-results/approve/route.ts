import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/app/lib/requireAdmin";

export async function POST(request: NextRequest) {
    const authorization = await requireAdmin();

    if(!authorization.authorized) {
        return NextResponse.json({ error: authorization.message }, { status: authorization.status });
    }

    let body: { meeting_id?: unknown };
    try {
        body = await request.json();    
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof body.meeting_id !== "number" || !Number.isInteger(body.meeting_id)) {
        return NextResponse.json({ error: "Invalid meeting ID" }, { status: 400 });
    }

    const { data, error } = await authorization.supabase.rpc(
        "approve_pending_results",
        { p_meeting_id: body.meeting_id }
    );

    if (error) {
        return NextResponse.json(
            { error: error.message,
              code: error.code,
              details: error.details,
            },
            { status: 500 }
        );
    }

    return NextResponse.json({ approvedCount: data }, { status: 200 });
}