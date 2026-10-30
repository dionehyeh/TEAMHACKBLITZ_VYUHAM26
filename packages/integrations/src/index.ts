/**
 * Third-party Connector Framework
 * Supports Google Drive, Slack, Notion, GitHub, and Microsoft Teams (Section 6 of IMPLEMENTATION.md)
 */

export type IntegrationProvider =
  | "google_drive"
  | "slack"
  | "notion"
  | "google_calendar"
  | "gmail"
  | "github"
  | "ms_teams";

export interface ConnectorConfig {
  provider: IntegrationProvider;
  organisationId: string;
  credentials: Record<string, string>;
  syncSchedule?: string;
}

export interface SyncResult {
  recordsProcessed: number;
  recordsFailed: number;
  syncCursor?: string;
  status: "success" | "partial" | "failed";
}
