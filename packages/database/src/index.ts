/**
 * Database client and repository access layer
 * Manages PostgreSQL / Supabase connections, schema access, and migrations
 */

export const DATABASE_VERSION = "0.1.0";

export interface DatabaseConfig {
  connectionString: string;
  maxConnections?: number;
}

export function getDatabaseConfig(): DatabaseConfig {
  return {
    connectionString:
      process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/bizcontext",
    maxConnections: 20,
  };
}
