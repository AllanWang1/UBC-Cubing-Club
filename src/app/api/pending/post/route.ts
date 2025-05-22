import { NextResponse, NextRequest } from "next/server";
import { supabase } from "../../../lib/SupabaseClient";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { attempt, cube_name, id, meeting_id, round, time_ms } = body;
    
    // Check if the result already exists
    const { data: existingResult, error: fetchError } = await supabase
        .from("PendingResults")
        .select("*")
        .eq("meeting_id", meeting_id)
        .eq("cube_name", cube_name)
        .eq("attempt", attempt)
        .eq("round", round)
        .eq("id", id)
        .neq("time_ms", -3);
    
    if (fetchError) {
        console.error("Error fetching existing result: ", fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }
    
    if (existingResult.length > 0) {
        return NextResponse.json(
        { message: "Result already exists" },
        { status: 409 }
        );
    }
    
    // Insert the new result
    const { data, error } = await supabase
        .from("PendingResults")
        .insert([
        {
            attempt,
            cube_name,
            id,
            meeting_id,
            round,
            time_ms,
        },
        ]);
    
    if (error) {
        console.error("Error inserting pending result: ", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 200 });
}