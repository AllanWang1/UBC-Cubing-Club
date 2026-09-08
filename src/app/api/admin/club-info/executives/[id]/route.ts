import {NextRequest, NextResponse} from "next/server";
import {requireAdmin} from "@/app/lib/requireAdmin";

type RouteContext = {
    params: Promise<{ id: string }>;
};

type ExecutiveQueryResult = {
    id: number;
    quote: string;
    avatar_path: string;
    Members: {
        name: string;
    };
    ClubExecutivePositions: {
        title: string;
        start_date: Date;
        end_date: Date | null;
    }[];
};

export async function GET(request: NextRequest, context: RouteContext) {
    const authorization = await requireAdmin();

    if (!authorization.authorized) {
        return NextResponse.json(
            { error: authorization.message },
            { status: authorization.status }
        );
    }

    const { id } = await context.params;
    const executiveId = Number(id);

    if (!Number.isInteger(executiveId) || executiveId <= 0) {
        return NextResponse.json({ error: "Invalid executive ID" }, { status: 400 });
    }

    const { data, error } = await authorization.supabase
        .from("ClubExecutiveInformation")
        .select("id, quote, avatar_path, Members(name), ClubExecutivePositions(title, start_date, end_date)")
        .eq("id", executiveId)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const result = data as unknown as ExecutiveQueryResult;

    const executive = {
        id: result.id,
        name: result.Members.name,
        quote: result.quote,
        avatar_path: result.avatar_path,
        positions: result.ClubExecutivePositions.map((pos) => ({
            title: pos.title,
            start_date: pos.start_date,
            end_date: pos.end_date,
        })),
    };

    return NextResponse.json({ executive }, { status: 200 });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    const authorization = await requireAdmin();
    
    if (!authorization.authorized) {
        return NextResponse.json(
            { error: authorization.message },
            { status: authorization.status }
        );
    }

    const { id } = await context.params;
    const executiveId = Number(id);

    if (!Number.isInteger(executiveId) || executiveId <= 0) {
        return NextResponse.json({ error: "Invalid executive ID" }, { status: 400 });
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
    }

    const { name, quote } = body as Record<string, unknown>;

    if (typeof name !== "string" || typeof quote !== "string") {
        return NextResponse.json({ error: "Both 'name' and 'quote' must be strings" }, { status: 400 });
    }

    const normalizedName = name.trim();
    const normalizedQuote = quote.trim();

    if (!normalizedName) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    const { data: member, error: memberError } = await authorization.supabase
        .from("Members")
        .update({ name: normalizedName })
        .eq("id", executiveId)
        .select("id, name")
        .single();

        if (memberError) {
        return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    const { data: executiveInfo, error: executiveError } = await authorization.supabase
        .from("ClubExecutiveInformation")
        .update({ quote: normalizedQuote })
        .eq("id", executiveId)
        .select("id, quote")
        .single();

    if (executiveError) {
        return NextResponse.json({ error: executiveError.message }, { status: 500 });
    }
    
    return NextResponse.json(
        {
            executive: {
                id: executiveInfo.id,
                name: member.name,
                quote: executiveInfo.quote,
            },
        },
        { status: 200 }
    );
}
