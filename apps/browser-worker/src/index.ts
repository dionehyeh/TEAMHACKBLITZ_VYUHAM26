/**
 * Browser Worker — Main entry point.
 *
 * Glue between:
 *   • BullMQ queue consumer (jobs arrive from modules/browser-jobs producer),
 *   • Isolated Playwright session,
 *   • Policy / permission enforcement,
 *   • Human approval gate,
 *   • Artifact store / evidence capture,
 *   • Event telemetry (Redis pub/sub + durable log).
 *
 * Architecture per IMPLEMENTATION.md §5:
 *   User / AI Assistant → Agent Orchestrator → Policy & Permission Check → Browser Job Queue → Isolated Browser Worker → Result returned to user.
 */

import { Queue } from "bullmq";
import type { Job as BullMQJob } from "bullmq";
import type { Redis as RedisClient } from "ioredis";
import { createLogger, type Logger } from "./logger";
import { parseDomainList, loadConfig } from "./config";
import { EventPublisher } from "./events/publisher";
import { JobRunner } from "./runner";
import { BrowserWorkerError, type BrowserWorkerConfig } from "./errors";
import { sha256Hex } from "./utils";
import type { BrowserWorkerEvent, EventName } from "./contracts";

/**
 * The bootstrap function that the `bun start` script triggers.
 *
 * It:
 *   1. Parses the env config,
 *   2. Opens the Redis connection,
 *   3. Spins up an EventPublisher,
 *   4. Creates a JobRunner with all dependencies,
 *   5. Starts a BullMQ Queue that pulls from `config().queueName`
 *      and calls `runner.execute(job.data)` for each incoming payload.
 *
 * Lifecycle: graceful shutdown on SIGINT/SIGTERM; each in-flight job finishes
 * before the worker exits (BullMQ default behaviour).
 */
export async function bootstrap(): Promise<void> {
  const cfg = loadConfig(process.env);
  const logger: Logger = createLogger("BrowserWorker", cfg.logLevel);
  logger.info("browser-worker.bootstrap.start", { configVersion: cfg.env, port: cfg.controlPlanePort });

  const redis = new (await import("ioredis")).default(cfg.redisUrl);

  // Create the BullMQ Queue for browser jobs
  const queue = new Queue(cfg.queueName, {
    connection: { host: cfg.redisUrl.split("://")[1] ?? "localhost", port: Number(cfg.redisUrl.split(":")[2]) ?? 6379 },
  });

  const eventPub = new EventPublisher({
    client: redis,
    channels: {
      events: `${cfg.queueName}:events`,
      eventLog: `${cfg.queueName}:events:log`,
    },
    log: logger,
    eventLogCapacity: 10_000,
  });

  const deps = {
    config: cfg,
    redis,
    logger,
    eventPub,
    artifactStore: new (await import("./artifacts/local-store")).LocalArtifactStore(
      cfg.artifactDir,
      cfg.stagingDir,
      cfg.evidenceRetentionHours,
    ),
  };

  const runnerConfig = {
    maxSteps: 50,
    stepTimeoutMs: 30_000,
    approvalTimeoutMs: 120_000,
    evidenceRetentionHours: cfg.evidenceRetentionHours,
    defaultScreenshot: true,
  };

  const runner = new (await import("./runner")).JobRunner(deps, runnerConfig);

  // Process jobs from the queue
  ;(queue as any).process("browser-job", async (job: BullMQJob) => {
    const result = await runner.execute(job.data);
    // Publish terminal result back via pub/sub + log
    try {
      await eventPub.publish({
        jobId: job.id!,
        organisationId: result.organisationId ?? job.data.organisationId,
        agentId: result.agentId ?? job.data.agentId,
        type: "job." + result.status,
        data: { stepsRequested: result.stepsRequested, stepsExecuted: result.stepsExecuted, durationMs: result.durationMs } as Record<string, unknown>,
      });
    } catch (_publishError) {
      logger.warn("worker.result_publish_failed", { jobId: job.id });
    }
    return result;
  });

  logger.info("browser-worker.bootstrap.ready", { queue: cfg.queueName, concurrency: 1 });

  // Graceful shutdown
  (globalThis as any).process.on("SIGINT", async () => {
    logger.info("browser-worker.shutdown.sigint");
    await queue.close();
    await redis.quit();
    (globalThis as any).process.exit(0);
  });

  (globalThis as any).process.on("SIGTERM", async () => {
    logger.info("browser-worker.shutdown.sigterm");
    await queue.close();
    await redis.quit();
    (globalThis as any).process.exit(0);
  });
}

/* When run directly: bun src/index.ts */
if (require.main === module) {
  bootstrap().catch((error) => {
    console.error("FATAL: browser-worker bootstrap failed:", error);
    process.exit(1);
  });
}

export default { bootstrap };