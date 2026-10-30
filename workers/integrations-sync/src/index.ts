/**
 * Worker: Integrations Sync Worker
 * Executes periodic and webhook-triggered synchronizations for external connectors (Slack, Google Drive, Notion, etc.).
 */

export const WORKER_NAME = "integrations-sync";

export async function startWorker() {
  console.log("Starting worker: integrations-sync");
}

if (import.meta.main) {
  startWorker();
}
