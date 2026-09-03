import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/requireAdmin";

export async function PATCH(request: NextRequest) {
    const authorization = await requireAdmin();

    if(!authorization.authorized) {
        return NextResponse.json(
            { error: authorization.message },
            { status: authorization.status }
        );
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }

    // Make sure the body is an object and has the required fields
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }
    
    const {
        location,
        time,
        instagram_name,
        discord_link,
        email,
        linktree_link,
    } = body as Record<string, unknown>;

    if (
        typeof location !== "string" ||
        typeof time !== "string" ||
        typeof instagram_name !== "string" ||
        typeof discord_link !== "string" ||
        typeof email !== "string" ||
        typeof linktree_link !== "string"  
    ) {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }

    // Normalize the input by trimming whitespace
    const normalized = {
        location: location.trim(),
        time: time.trim(),
        instagram_name: instagram_name.trim(),
        discord_link: discord_link.trim(),
        email: email.trim(),
        linktree_link: linktree_link.trim(),
    }

    if (Object.values(normalized).some(value => value === "")) {
        return NextResponse.json(
            { error: "All fields are required" },
            { status: 400 }
        );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(normalized.email)) {
        return NextResponse.json(
            { error: "Invalid email format" },
            { status: 400 }
        );
    }

    const instagramPattern = /^[a-zA-Z0-9._]{1,30}$/;
    if (!instagramPattern.test(normalized.instagram_name)) {
        return NextResponse.json(
            { error: "Invalid Instagram username format" },
            { status: 400 }
        );
    }

    function isValidHttpUrl(url: string): boolean {
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
        } catch {
            return false;
        }
    }

    if (!isValidHttpUrl(normalized.discord_link) || !isValidHttpUrl(normalized.linktree_link)) {
        return NextResponse.json(
            { error: "Invalid URL format" },
            { status: 400 }
        );
    }

    const { data, error } = await authorization.supabase
    .from("ClubBasicInformation")
    .update(normalized)
    .eq("id", 1)
    .select()
    .single();

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}