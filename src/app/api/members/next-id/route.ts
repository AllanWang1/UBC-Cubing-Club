import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";

export async function GET(request: NextRequest) {
    const { data, error } = await supabase
        .rpc("get_next_id")
        .single();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    else {
        console.log("Next ID: ", data);
        return NextResponse.json(data, { status: 200 });
    }
}