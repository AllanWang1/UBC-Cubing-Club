import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/requireAdmin";

const DNF_TIME_MS = 99999999;
const ALLOWED_PENALTIES = ["OK", "+2", "+4", "+6", "DNF"];

type Penalty = (typeof ALLOWED_PENALTIES[number]);

interface UpdatePendingResultRequestBody {
    meeting_id: number;
    id: number;
    cube_name: string;
    round: number;
    attempt: number;
    raw_time_ms: number;
    penalty: Penalty | null;
}

export async function PATCH(request: NextRequest) {
    const authorization = await requireAdmin();

    if(!authorization.authorized) {
        return NextResponse.json({ error: authorization.message }, { status: authorization.status });
    }

    let body: UpdatePendingResultRequestBody;
    try {
        body = await request.json();    
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { meeting_id, id, cube_name, round, attempt, raw_time_ms, penalty } = body;

    if (
        !Number.isInteger(meeting_id) || 
        !Number.isInteger(id) || 
        !Number.isInteger(round) || 
        !Number.isInteger(attempt) || 
        !Number.isInteger(raw_time_ms) || 
        raw_time_ms < 0 || 
        !cube_name ||
        (penalty !== null && !ALLOWED_PENALTIES.includes(penalty))
    ) {
        return NextResponse.json({ error: "Invalid pending results" }, { status: 400 });
    }

    let finalTimeMs = raw_time_ms;

    if (penalty === "DNF") {
        finalTimeMs = DNF_TIME_MS;
    } else if (penalty === "+2") {
        finalTimeMs = raw_time_ms + 2000;
    } else if (penalty === "+4") {
        finalTimeMs = raw_time_ms + 4000;
    } else if (penalty === "+6") {
        finalTimeMs = raw_time_ms + 6000;
    }

    const storedPenalty = penalty === "OK" ? null : penalty;

    const { data, error } = await authorization.supabase
        .from("PendingResults")
        .update({
            raw_time_ms,
            penalty: storedPenalty,
            time_ms: finalTimeMs,
        })
        .eq("meeting_id", meeting_id)
        .eq("id", id)
        .eq("cube_name", cube_name)
        .eq("round", round)
        .eq("attempt", attempt)
        .select()
        .single();

    if(error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(data, { status: 200 });
}

export async function DELETE(request: NextRequest) {
    const authorization = await requireAdmin();

    if(!authorization.authorized) {
        return NextResponse.json({ error: authorization.message }, { status: authorization.status });
    }

    let body: {
        meeting_id: number;
        id: number;
        cube_name: string;
        round: number;
        attempt: number;
    };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { meeting_id, id, cube_name, round, attempt } = body;

    if (
        !Number.isInteger(meeting_id) ||
        !Number.isInteger(id) ||
        !Number.isInteger(round) ||
        !Number.isInteger(attempt) ||
        !cube_name
    ) {
        return NextResponse.json({ error: "Invalid pending results" }, { status: 400 });
    }

    const { data, error } = await authorization.supabase
        .from("PendingResults")
        .delete()
        .eq("meeting_id", meeting_id)
        .eq("id", id)
        .eq("cube_name", cube_name)
        .eq("round", round)
        .eq("attempt", attempt)
        .select()
        .single();

        if (error) {
            return NextResponse.json(
                { error: error.message,
                    code: error.code,
                    details: error.details,
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            data, { status: 200 }
        );
}