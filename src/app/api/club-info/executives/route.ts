import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/SupabaseServer";
import { Executive, ExecutivePosition } from "@/app/types/Executive";

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

function getTotalYears(positions: ExecutivePosition[]) {
  return positions.reduce((total, pos) => {
    const start = pos.start_date.getTime();
    const end = pos.end_date ? pos.end_date.getTime() : new Date().getTime();

    return total + (end - start);
  }, 0);
}

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
    positions: executive.ClubExecutivePositions.map((pos) => ({
      title: pos.title,
      start_date: new Date(pos.start_date),
      end_date: pos.end_date ? new Date(pos.end_date) : null,
    })),
  }));

  const sorted_executives = executives.sort((a, b) => {
    const aCurrentPresident = a.positions.some(
      (pos) => pos.title === "President" && pos.end_date === null,
    );
    const bCurrentPresident = b.positions.some(
      (pos) => pos.title === "President" && pos.end_date === null,
    );
    // Current President always first
    if (aCurrentPresident !== bCurrentPresident) {
      return Number(bCurrentPresident) - Number(aCurrentPresident);
    }
    const aCurrent = a.positions.some((pos) => pos.end_date === null);
    const bCurrent = b.positions.some((pos) => pos.end_date === null);

    // Other current executives before past executives
    if (aCurrent !== bCurrent) {
      return Number(bCurrent) - Number(aCurrent);
    }
    
    // Longer-serving executives first
    return getTotalYears(b.positions) - getTotalYears(a.positions);
  });

  return NextResponse.json(sorted_executives, { status: 200 });
}
