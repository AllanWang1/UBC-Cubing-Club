import { NextResponse } from "next/server";
import { supabase } from "../../lib/SupabaseClient";

export async function GET() {
    const { data, error } = await supabase
        .from("Members")
        .select("*");
    
    if (error) {
        return NextResponse.json({ error: error.message }, {status: 500});
    }
    else {
        console.log("Members: ", data);
        return NextResponse.json(data, {status: 200});
    }
}