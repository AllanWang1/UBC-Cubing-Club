import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/lib/requireAdmin";
import { Executive } from "@/app/types/Executive";

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

export async function GET() {
    const authorization = await requireAdmin();
    
    if(!authorization.authorized) {
        return NextResponse.json(
            { error: authorization.message },
            { status: authorization.status }
        );
    }  

    const { data, error } = await authorization.supabase.from("ClubExecutiveInformation")
        .select("id, quote, avatar_path, Members(name), ClubExecutivePositions(title, start_date, end_date)");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const executives: Executive[] = (
        data as unknown as ExecutiveQueryResult[]
    ).map((executive) => ({
        id: executive.id,
        name: executive.Members.name,
        quote: executive.quote,
        avatar_path: executive.avatar_path,
        positions: executive.ClubExecutivePositions.map((pos) => ({
        title: pos.title,
        start_date: new Date(pos.start_date),
        end_date: pos.end_date ? new Date(pos.end_date) : null,
        })),
  }));

    return NextResponse.json({ executives }, { status: 200 });
}