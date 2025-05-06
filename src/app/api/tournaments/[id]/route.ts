import { NextResponse, NextRequest } from "next/server";
import { supabase } from "../../../lib/SupabaseClient";

export async function GET(request: NextRequest) {
    const id = request.nextUrl.pathname.split("/").pop();

    const { data, error } = await supabase
        .from("Tournaments")
        .select("*")
        .eq("MeetingID", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    else {
        console.log("Tournament: ", data);
        return NextResponse.json(data, {status: 200});
    }
}