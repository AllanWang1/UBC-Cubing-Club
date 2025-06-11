import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const meeting_id = searchParams.get("meeting_id");


    const { data, error } = await supabase
        .from("PendingResults")
        .select("*")
        .eq("meeting_id", meeting_id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("Pending results fetched: ", data);
    return NextResponse.json(data, { status: 200 });
}