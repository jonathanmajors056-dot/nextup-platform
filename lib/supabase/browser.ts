import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseConfig } from "./config";

let client: SupabaseClient | undefined;

export function getBrowserSupabase() {
  if (client) return client;
  const config = requireSupabaseConfig();
  client = createBrowserClient(config.url, config.anonKey);
  return client;
}
