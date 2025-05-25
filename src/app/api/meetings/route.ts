import { NextResponse } from "next/server";
import { supabase } from "../../lib/SupabaseClient";

export async function GET() {
    const {data: Tournaments, error} = await supabase
        .from("Meetings")
        .select("meeting_id, meeting_name")
       
    if (error) {
        return NextResponse.json({error: error.message}, {status: 500});
    }
    // no error, we are ok
    return NextResponse.json(Tournaments, {status: 200});
}
