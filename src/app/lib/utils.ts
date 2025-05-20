import { supabase } from "../lib/SupabaseClient";

export function formatTime(ms: number): string {
  if (ms === -1) return "DNF";
  if (ms === -2) return "DNS";
  
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

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }
  return data?.user ?? null;
}