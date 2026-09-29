import { createClient } from "@supabase/supabase-js";
import { requireSupabaseConfig } from "./config";

let client: ReturnType<typeof createClient> | undefined;

export function getAdminSupabase() {
  if (client) return client;
  const config = requireSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");

  client = createClient(config.url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}
