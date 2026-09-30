import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

// Singleton: reuse the same browser client everywhere so all components
// (header, pages, etc.) share one auth session/listener instead of each
// creating its own client that doesn't know about the others' sign-ins.
export function createClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  client = createBrowserClient(url, anonKey);
  return client;
}
