import { NextResponse } from "next/server";
import { supabase } from "../../lib/SupabaseClient";

export async function GET() {
    const { data, error } = await supabase
        .from("Cubes")
        .select("*")
        .order("order")

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
}