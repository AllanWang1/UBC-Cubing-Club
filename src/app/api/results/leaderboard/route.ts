import { NextResponse } from "next/server";
import { supabase } from "../../../lib/SupabaseClient";

export async function GET() {
    /**
     * What we need for the leaderboard page: 
     * For each cube name: 
     * - The rank of the result
     * - Name of the member
     * - Resulting time
     * - Meeting name 
     */
    const { data, error } = await supabase.rpc("all_member_records");
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("Results: ", data);
    return NextResponse.json(data, {status: 200});
}