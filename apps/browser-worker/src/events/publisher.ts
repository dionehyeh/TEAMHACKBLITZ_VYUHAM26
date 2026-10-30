import type Redis from "ioredis";
import {
  type BrowserWorkerEvent,
  EVENT_TYPES,
  type EventName,
  EventSchema,
} from "../contracts";
import type { Logger } from "../logger";
import { redactValue } from "../logger";

/**
 * Event publisher — the worker's outbound telemetry spine.
 *
 * Every runtime signal flows through here in three forms:
 *   1. Realtime: Redis pub/sub `"{queue}:events"` (JSON envelope).
 *   2. Durable: capped Redis LIST `"{queue}:events:log"` (latest 10_000),
 *      so consumers can LPUSH/`LRANGE` for backfill on startup.
 *   3. Terminal results additionally ride the BullMQ return value.
 *
 * Publishing failures are logged and swallowed — telemetry must never
 * crash a running job.
 */

export interface PublishedEvent {
  seq: number;
  ts: string;
  jobId: string;
  organisationId?: string;
  agentId?: string;
  agentVersion?: string;
  type: EventName;
  data: Record<string, unknown>;
}

export interface EventPublicationInput {
  jobId: string;
  organisationId?: string;
  agentId?: string;
  agentVersion?: string;
  type: EventName;
  data: Record<string, unknown>;
}

export interface EventPublisherOptions {
  client: Redis;
  channels: { events: string; eventLog: string };
  log: Logger;
  /** Cap for the durable log list, trimmed on every publish. */
  eventLogCapacity?: number;
}

export class EventPublisher {
  private readonly seqByJob = new Map<string, number>();

  constructor(private readonly options: EventPublisherOptions) {}

  async publish(input: EventPublicationInput): Promise<void> {
    const seq = (this.seqByJob.get(input.jobId) ?? 0) + 1;
    this.seqByJob.set(input.jobId, seq);
    if (EVENT_TYPES.includes(input.type) === false) {
      this.options.log.warn("events.unknown_type_suppressed", { jobId: input.jobId, type: input.type });
      return;
    }
    const event: PublishedEvent = {
      seq,
      ts: new Date().toISOString(),
      jobId: input.jobId,
      organisationId: input.organisationId,
      agentId: input.agentId,
      agentVersion: input.agentVersion,
      type: input.type,
      data: (redactValue(input.data) as Record<string, unknown>) ?? {},
    };
    const payload = JSON.stringify(event);
    try {
      await this.options.client.lpush(this.options.channels.eventLog, payload);
      await this.options.client.ltrim(this.options.channels.eventLog, 0, (this.options.eventLogCapacity ?? 10_000) - 1);
    } catch (error) {
      this.options.log.warn("events.event_log_failed", { jobId: input.jobId, error: String(error) });
    }
    this.options.client.publish(this.options.channels.events, payload).catch((error) => {
      this.options.log.warn("events.pubsub_failed", { jobId: input.jobId, error: String(error) });
    });
  }

  forget(jobId: string): void {
    this.seqByJob.delete(jobId);
  }

  /** Validate an event pulled off the wire (consumer side helper). */
  static parse(raw: unknown): BrowserWorkerEvent | null {
    const result = EventSchema.safeParse(raw);
    return result.success ? result.data : null;
  }
}
