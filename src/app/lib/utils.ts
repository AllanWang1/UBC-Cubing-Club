import { supabase } from "../lib/SupabaseClient";
import { Result } from "@/app/types/Result";
import { User } from "@supabase/auth-js";

export const DNF = 99999999;
export const ADMIN_ROLES = ["admin", "president", "treasurer"];

export function formatTime(ms: number): string {
  // This is what DNF is defined to be; to calculate an average, it must be less than DNF/3
  // Then, this means if there is a DNF included in the average, it will be greater than DNF/3, which still shows DNF.
  // This is ok because 33333333 milliseconds is 9 hours and 15 minutes, which is reasonable for a DNF.
  if (ms < 0 || ms > DNF / 3) return "DNF";

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);

  if (seconds === 0 && minutes === 0) {
    return `0.${centiseconds.toString().padStart(2, "0")}`;
  }
  if (minutes === 0) {
    return `${seconds.toString()}.${centiseconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds
    .toString()
    .padStart(2, "0")}`;
}

export function getPublicURLWithPath(path: string): string {
  if (!path) return "";
  const { data } = supabase.storage.from("cubeicons").getPublicUrl(path);
  // Get publicUrl from data if not null; if null, return null
  return data?.publicUrl ?? "";
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user: fetchedUser },
  } = await supabase.auth.getUser();
  return fetchedUser;
}

export function getRadarStats(results: Result[]) {
  const nxnCubes = [
    "3x3",
    "2x2",
    "4x4",
    "5x5",
    "6x6",
    "7x7",
    "FMC",
    "3x3 OH",
    "3x3 BLD",
  ];
  const nonCubicCubes = ["Pyraminx", "Skewb", "Clock", "Megaminx", "Square-1"];

  const groupedByEvent = new Map<string, Result[]>();
  for (const result of results) {
    if (!groupedByEvent.has(result.cube_name)) {
      groupedByEvent.set(result.cube_name, []);
    }
  }
}

export async function getUserRole(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.user_metadata?.member_id) {
    const response = await fetch(
      `/api/members/${user.user_metadata.member_id}/role`
    );
    const res_json = await response.json();
    if (response.ok) {
      return res_json.role;
    }
  }
  return null;
}
