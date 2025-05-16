import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const meeting_id = searchParams.get("meeting_id");
    const cube_name = searchParams.get("cube_name");
    // This should only return one row, as meeting_id and cube_name make up the primary key.
    const { data, error } = await supabase
        .from("Holds")
        .select(
            "meeting_id, cube_name, format, rounds, Cubes(cube_name, icon_link), FormatAttempts(format, max_attempts), Meetings(meeting_id, status)"
        )
        .eq("meeting_id", meeting_id)
        .eq("cube_name", cube_name)
        .eq("Meetings.status", "open");
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else if (data.length === 0) {
            return NextResponse.json({ error: "No event found at meeting "}, { status: 404 });
        } else if (data[0].Meetings === null) {
            return NextResponse.json({ error: "Meeting not open" }, { status: 404 });
        }
        console.log("Holds event: ", data);
        return NextResponse.json(data, { status: 200 });
}