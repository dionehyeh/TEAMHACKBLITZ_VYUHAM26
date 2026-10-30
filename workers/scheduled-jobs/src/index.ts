/**
 * Worker: Scheduled Jobs Worker
 * Runs SLA checks, task deadline reminders, recurring cron tasks, and housekeeping jobs.
 */

export const WORKER_NAME = "scheduled-jobs";

export async function startWorker() {
  console.log("Starting worker: scheduled-jobs");
}

if (import.meta.main) {
  startWorker();
}
