/**
 * This route fetches the member for the given id, along with their top results in each event (single and average)
 * 
 * The query used in this file requires a custom one to be built in supabase.
 */

import { NextResponse, NextRequest } from "next/server";
import { supabase } from "../../../lib/SupabaseClient";

export async function GET(request: NextRequest) {
    const id = request.nextUrl.pathname.split("/").pop();
    /**
     *  SELECT M.id, M.name, MIN(R.time_ms), R.cube_name
        FROM public."Members" M, public."Results" R
        WHERE M.id = R.id
        GROUP BY R.cube_name, M.id
        ORDER BY M.id
     */
    const { data, error } = await supabase.rpc("member_results", {
        member_id: id,
    });
        
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("Member Best Single Results: ", data);
    return NextResponse.json(data, {status: 200});
}