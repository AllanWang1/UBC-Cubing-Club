import { NextResponse } from "next/server";
import { supabase } from "../../../lib/SupabaseClient";

export async function GET() {
    /**
     * What we need for the leaderboard page: 
     * For each cube name: 
     * - The rank of the result
     * - Name of the member
     * - Resulting time
     * - Competition name 
     * 
     * SELECT M.name, MIN(R.time_ms), Mt.meeting_name, C.cube_name, C.icon_link
     * FROM Results R, Members M, Meetings Mt, Cubes C
     * WHERE R.member_id = M.id AND R.meeting_id = Mt.meeting_id AND R.cube_name = C.cube_name
     * GROUP BY M.id, C.cube_name
     * 
     * 
     */
    const { data, error } = await supabase.rpc("get_single_results");
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("Results: ", data);
    return NextResponse.json(data, {status: 200});
}