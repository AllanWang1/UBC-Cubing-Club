import { NextResponse } from "next/server";
import { supabase } from "../../lib/SupabaseClient";

export async function GET() {
    const {data: Tournaments, error} = await supabase
        .from("Tournaments")
        .select("meeting_id, name")
       
    if (error) {
        return NextResponse.json({error: error.message}, {status: 500});
    }
    // no error, we are ok
    console.log("Tournaments: ", Tournaments);
    return NextResponse.json(Tournaments, {status: 200});
}
