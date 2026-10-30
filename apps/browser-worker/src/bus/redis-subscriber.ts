import Redis from "ioredis";
import { ApprovalDecisionSchema, CancelMessageSchema, type ApprovalDecisionMessage, type CancelMessage } from "../contracts";
import type { Logger } from "../logger";
import type Redis2 from "ioredis";

export type RedisClientLike = Redis | Redis2;

export interface SubscriberHandlers {
  onApprovalDecision(message: ApprovalDecisionMessage): void;
  onCancel(message: CancelMessage): void;
}

export interface SubscriberConfig {
  redisUrl: string;
  approvalsChannel: string;
  cancelChannel: string;
}

/**
 * Redis pub/sub subscriber for control messages:
 *   - approval decisions  ({queue}:approvals)
 *   - cancellation requests ({queue}:cancel)
 *
 * Messages are schema-validated before dispatch; malformed messages are
 * logged and ignored so a bad producer cannot break a running worker.
 */
export class RedisSubscriber {
  private readonly client: Redis;

  constructor(
    private readonly config: SubscriberConfig,
    private readonly handlers: SubscriberHandlers,
    private readonly log: Logger,
  ) {
    this.client = new Redis(config.redisUrl);
  }

  async start(): Promise<void> {
    await this.client.subscribe(this.config.approvalsChannel, this.config.cancelChannel);
    this.client.on("message", (channel: string, message: string) => {
      this.handleMessage(channel, message);
    });
    this.client.on("error", (error: Error) => {
      this.log.error("subscriber.connection_error", { message: error.message });
    });
    this.log.info("subscriber.started", {
      approvalsChannel: this.config.approvalsChannel,
      cancelChannel: this.config.cancelChannel,
    });
  }

  private handleMessage(channel: string, message: string): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(message);
    } catch {
      this.log.warn("subscriber.malformed_json", { channel });
      return;
    }
    try {
      if (channel === this.config.approvalsChannel) {
        const decision = ApprovalDecisionSchema.safeParse(parsed);
        if (!decision.success) {
          this.log.warn("subscriber.invalid_approval_message", { issueCount: decision.error.issues.length });
          return;
        }
        this.handlers.onApprovalDecision(decision.data);
        return;
      }
      if (channel === this.config.cancelChannel) {
        const cancel = CancelMessageSchema.safeParse(parsed);
        if (!cancel.success) {
          this.log.warn("subscriber.invalid_cancel_message", { issueCount: cancel.error.issues.length });
          return;
        }
        this.handlers.onCancel(cancel.data);
      }
    } catch (error) {
      this.log.error("subscriber.dispatch_failed", { error: String(error) });
    }
  }

  async close(): Promise<void> {
    await this.client.quit().catch(() => undefined);
  }
}
