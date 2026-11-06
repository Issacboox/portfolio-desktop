import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { supabasePublishableKey, supabaseUrl } from "@/lib/env";

/** Supabase client for Client Components (respects RLS as the signed-in user). */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl(), supabasePublishableKey());
}
