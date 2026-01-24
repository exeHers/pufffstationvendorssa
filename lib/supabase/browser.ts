import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function supabaseBrowser() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    // Return a dummy client or throw a more descriptive error if called on server without envs
    // During build, we might not have these, so we return a proxy or handle it in the caller.
    // However, createClient will throw if url is missing.
    if (typeof window === "undefined") {
      // Return a proxy that throws only when used, to avoid crashing during prerender of pages that don't actually use it on server
      return new Proxy({} as SupabaseClient, {
        get() {
          throw new Error("Supabase browser client called on server without environment variables.");
        },
      });
    }
  }
  
  client = createClient(url!, anon!);
  return client;
}
