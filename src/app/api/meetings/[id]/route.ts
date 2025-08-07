import { NextResponse, NextRequest } from "next/server";
import { supabase } from "../../../lib/SupabaseClient";

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