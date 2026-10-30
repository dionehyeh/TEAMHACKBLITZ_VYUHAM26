import type { Context } from "hono";
import { getSupabaseAnonClient } from "./supabase";

export interface AuthContext {
  userId: string;
  email: string;
}

/**
 * Resolves the authenticated user from the Bearer token.
 * Returns null when the token is missing or invalid.
 */
export async function getAuthContext(c: Context): Promise<AuthContext | null> {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    return null;
  }

  const supabase = getSupabaseAnonClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? "",
  };
}
