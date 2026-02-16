"use server";

import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for server-side usage.
 * Awaiting the cookies() call ensures the user's session is passed to Supabase,
 * allowing Row Level Security (RLS) to identify the user via auth.uid().
 */
export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    "https://aprxkjdevkzpsbjumkmm.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwcnhramRldmt6cHNianVta21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzNTU0MjcsImV4cCI6MjA1NDkzMTQyN30.RDvcvsMhJCxKdynvD9SS3oFvSxp9E1Y0Ok2E6Rnpe1g",
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (newCookies) => {
          try {
            newCookies.forEach((cookie) =>
              cookieStore.set(cookie.name, cookie.value, cookie.options)
            );
          } catch (error) {
            // The 'set' method can fail if called from a Server Component.
            // This is expected behavior in Next.js; cookies can only be
            // set in Actions or Route Handlers.
          }
        },
      },
    }
  );
};
