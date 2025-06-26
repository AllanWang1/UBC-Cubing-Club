import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const meeting_id = searchParams.get("meeting_id");
    const attempt = searchParams.get("attempt");
    const cube_name = searchParams.get("cube_name");
    const round = searchParams.get("round");

    const { data, error } = await supabase
        .from("Scrambles")
        .select("scramble")
        .eq("meeting_id", meeting_id)
        .eq("attempt", attempt)
        .eq("cube_name", cube_name)
        .eq("round", round)
        .single();
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("scramble: ", data);
    return NextResponse.json(data, { status: 200 });
}