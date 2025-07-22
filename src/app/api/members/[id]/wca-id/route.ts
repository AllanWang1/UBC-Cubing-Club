import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";

export async function GET(request: NextRequest) {
    // The path will be /members/[id]/wca-id. We need to extract the [id] part.
    const id = request.nextUrl.pathname.split("/").slice(-2, -1)[0];

    const { data, error } = await supabase
        .from("Members")
        .select("wca_id")
        .eq("id", id)
        .single();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    else {
        if (!data) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 });
        }
        return NextResponse.json(data, { status: 200 });
    }
}