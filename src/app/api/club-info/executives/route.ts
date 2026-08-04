import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/SupabaseServer";
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

export async function GET(request: NextRequest) {
  const supabaseServer = await createSupabaseServerClient();
  const { data, error } = await supabaseServer
    .from("ClubExecutiveInformation")
    .select(
      "id, quote, avatar_path, Members(name), ClubExecutivePositions(title, start_date, end_date)",
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // resolve type issue where TypeScript confuses the Members to be of array type.Thus, cast to unknown then to ExecutiveQueryResult[] to ensure correct typing.
  const executives: Executive[] = (
    data as unknown as ExecutiveQueryResult[]
  ).map((executive) => ({
    id: executive.id,
    name: executive.Members.name,
    quote: executive.quote,
    avatar_path: executive.avatar_path,
    positions: executive.ClubExecutivePositions,
  }));

  return NextResponse.json(executives, { status: 200 });
}
