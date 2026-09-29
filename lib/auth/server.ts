import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export class AuthError extends Error {
  constructor(public readonly status: 401 | 403, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function getCurrentUser() {
  if (!hasSupabaseConfig()) return null;
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError(401, "Authentication required");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new AuthError(403, "Admin authorization required");
  return user;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) return Response.json({ error: error.message }, { status: error.status });
  throw error;
}
