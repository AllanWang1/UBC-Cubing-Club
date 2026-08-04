import { NextResponse, NextRequest } from "next/server";
import { supabase } from "../../../lib/SupabaseClient";
import { requireAdmin } from "@/app/lib/requireAdmin";

export async function GET(request: NextRequest) {
    const id = request.nextUrl.pathname.split("/").pop();
    // This will still give an array of a single meeting, so .single is added.
    const { data, error } = await supabase
        .from("Meetings")
        .select("*")
        .eq("meeting_id", id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    else {
        console.log("Meeting: ", data);
        return NextResponse.json(data, {status: 200});
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const authorization = await requireAdmin();

    if (!authorization.authorized) {
        return NextResponse.json({ error: authorization.message }, { status: authorization.status });
    }

    const { id } = await params;
    const meetingId = Number(id);

    if (!Number.isInteger(meetingId)) {
        return NextResponse.json({ error: "Invalid meeting ID" }, { status: 400 });
    }

    let body: { status?: unknown };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (body.status != "open" && body.status != "closed") {
        return NextResponse.json({ error: "Status must be either 'open' or 'closed'" }, { status: 400 });
    }

    const { data, error } = await authorization.supabase
        .from("Meetings")
        .update({ status: body.status })
        .eq("meeting_id", meetingId)
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { error: error.message,
              code: error.code,
              details: error.details,
            },
            { status: 500 }
        );
    }

    return NextResponse.json(data, { status: 200 });

}