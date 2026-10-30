/**
 * Authentication Utilities
 * Manages Supabase Auth, session tokens, JWT verification, and user resolution
 */

export interface SessionUser {
  id: string;
  email: string;
  organisationId?: string;
  role?: string;
}

export function parseAuthorizationHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
