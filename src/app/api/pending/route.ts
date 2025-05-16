import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/app/lib/SupabaseClient";
// import { useSearchParams } from "next/navigation";

export async function GET(request: NextRequest) {

    
  // const searchParams = useSearchParams();
  // const meeting_id = searchParams.get("meeting_id");
  // const round = searchParams.get("round");
  // const attempt = searchParams.get("attempt");
  // const cube_name = searchParams.get("cube_name");

  // const { data, error } = await supabase
  //   .from("PendingResults") 
  //   .select("*")
  //   .eq("meeting_id", meeting_id)
  //   .eq("round", round)
  //   .eq("attempt", attempt)
  //   .eq("cube_name", cube_name)

}
