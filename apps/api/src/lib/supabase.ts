import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

export function getSupabaseAnonClient(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(
      process.env.SUPABASE_URL || "http://localhost:54321",
      process.env.SUPABASE_ANON_KEY || ""
    );
  }
  return anonClient;
}

export function getSupabaseServiceClient(): SupabaseClient {
  if (!serviceClient) {
    serviceClient = createClient(
      process.env.SUPABASE_URL || "http://localhost:54321",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );
  }
  return serviceClient;
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export async function resolveAuthUser(
  token: string
): Promise<{ userId: string | null; error: Error | null }> {
  const supabase = getSupabaseAnonClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { userId: null, error: error ?? new Error("User not found") };
  }
  return { userId: data.user.id, error: null };
}
