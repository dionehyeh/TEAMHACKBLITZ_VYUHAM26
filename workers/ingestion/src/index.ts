/**
 * Worker: Document Ingestion Worker
 * Handles parsing, OCR, and text extraction for uploaded PDFs, docs, and images.
 */

export const WORKER_NAME = "ingestion";

export async function startWorker() {
  console.log("Starting worker: ingestion");
}

if (import.meta.main) {
  startWorker();
}
