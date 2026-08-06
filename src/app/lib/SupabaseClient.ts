import { createBrowserClient } from "@supabase/ssr/dist/main/createBrowserClient";

// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
//     throw new Error("Missing Supabase environment variables");
// }

const SUPABASE_URL = "https://aprxkjdevkzpsbjumkmm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwcnhramRldmt6cHNianVta21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzNTU0MjcsImV4cCI6MjA1NDkzMTQyN30.RDvcvsMhJCxKdynvD9SS3oFvSxp9E1Y0Ok2E6Rnpe1g";


export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);