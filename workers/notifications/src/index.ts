/**
 * Worker: Notification Worker
 * Processes outbound notifications, emails, webhooks, and push alerts asynchronously.
 */

export const WORKER_NAME = "notifications";

export async function startWorker() {
  console.log("Starting worker: notifications");
}

if (import.meta.main) {
  startWorker();
}
