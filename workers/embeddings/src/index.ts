/**
 * Worker: Embeddings Worker
 * Performs document chunking and generates vector embeddings for pgvector semantic search.
 */

export const WORKER_NAME = "embeddings";

export async function startWorker() {
  console.log("Starting worker: embeddings");
}

if (import.meta.main) {
  startWorker();
}
