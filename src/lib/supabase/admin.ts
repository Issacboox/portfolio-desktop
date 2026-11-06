import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseUrl } from "@/lib/env";

/**
 * Privileged Supabase client using the SECRET key. Bypasses RLS.
 * Server-only: use for writing chat logs, embeddings and other system tasks.
 */
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) throw new Error("Missing environment variable: SUPABASE_SECRET_KEY");

  return createClient<Database>(supabaseUrl(), secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
