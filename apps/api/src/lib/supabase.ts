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
