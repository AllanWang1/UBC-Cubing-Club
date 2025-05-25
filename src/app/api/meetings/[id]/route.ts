import { NextResponse, NextRequest } from "next/server";
import { supabase } from "../../../lib/SupabaseClient";

export async function GET(request: NextRequest) {
    const id = request.nextUrl.pathname.split("/").pop();

    const { data, error } = await supabase
        .from("Meetings")
        .select("*")
        .eq("meeting_id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    else {
        return NextResponse.json(data, {status: 200});
    }
}