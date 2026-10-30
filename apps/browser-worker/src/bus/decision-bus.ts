import type { StepKind } from "../contracts";
import type Redis from "ioredis";

/**
 * DecisionBus + ApprovalCoordination — the human-approval gate.
 *
 * Protocol (docs/WIRE-CONTRACT.md):
 *   1. When a step hits `require_approval`, the runner emits
 *      `job.approval.requested` carrying the action FINGERPRINT — an
 *      sha256 binding of (jobId, stepIndex, kind, target, payloadValue).
 *   2. The job transitions to runtime status `awaiting_approval` and waits.
 *   3. The producer API resolves the decision and EITHER publishes it on the
 *      approvals pub/sub channel (schema: ApprovalDecisionMessage) OR exposes
 *      it at GET {BROWSER_JOBS_API_URL}/browser-jobs/{jobId}/approvals/{fingerprint}
 *      (schema: ApprovalPollResponse). Pub/sub is the fast path; polling is
 *      the slow path so a missed pub/sub message never wedges a job.
 *   4. A fingerprint match is REQUIRED. A decision for any other fingerprint
 *      is ignored — if the action changed after approval, approval is void
 *      (IMPLEMENTATION.md 5.4).
 *   5. First decision wins. Late duplicates are cached for 120s in case the
 *      gate registers a millisecond after the message landed.
 *   6. Timeout → the job becomes `expired` (termination "approval_timeout").
 */

export type DecisionSource = "pubsub" | "poll";

export interface DecisionResult {
  decision: "approved" | "rejected";
  source: DecisionSource;
  decidedBy?: string;
  decidedAt?: string;
}

interface Waiter {
  resolve: (result: DecisionResult) => void;
}

const RECENT_DECISION_TTL_MS = 120_000;

export class DecisionBus {
  private readonly waiters = new Map<string, Waiter>();
  private readonly recent = new Map<string, { result: DecisionResult; expiresAt: number }>();

  constructor(private readonly subscriber: Redis | null = null) {}

  /** Fan-in for approval decisions arriving via Redis pub/sub. */
  dispatch(message: {
    jobId: string;
    fingerprint: string;
    decision: "approved" | "rejected";
    decidedBy?: string;
    decidedAt?: string;
  }): void {
    const key = `${message.jobId}:${message.fingerprint}`;
    const waiter = this.waiters.get(key);
    if (waiter) {
      this.waiters.delete(key);
      waiter.resolve({
        decision: message.decision,
        source: "pubsub",
        decidedBy: message.decidedBy,
        decidedAt: message.decidedAt,
      });
      return;
    }
    this.recent.set(key, {
      result: {
        decision: message.decision,
        source: "pubsub",
        decidedBy: message.decidedBy,
        decidedAt: message.decidedAt,
      },
      expiresAt: Date.now() + RECENT_DECISION_TTL_MS,
    });
  }

  recentDecision(jobId: string, fingerprint: string): DecisionResult | null {
    const key = `${jobId}:${fingerprint}`;
    const cached = this.recent.get(key);
    if (!cached) return null;
    if (cached.expiresAt < Date.now()) {
      this.recent.delete(key);
      return null;
    }
    this.recent.delete(key); // first consumer wins
    return cached.result;
  }

  waitFor(jobId: string, fingerprint: string): { promise: Promise<DecisionResult>; cancel(): void } {
    const key = `${jobId}:${fingerprint}`;
    let waiter!: Waiter;
    const promise = new Promise<DecisionResult>((resolve) => {
      waiter = { resolve };
    });
    this.waiters.set(key, waiter);
    return {
      promise,
      cancel: () => {
        this.waiters.delete(key);
      },
    };
  }

  close(): void {
    this.waiters.clear();
    this.recent.clear();
  }
}

/**
 * Correctness fallback: poll the producer API for the decision of a specific
 * fingerprint. The promise NEVER rejects (functional errors resolve to
 * undefined) so it can safely compete in a race that also includes a
 * pub/sub waiter and an approval timeout.
 */
export class ApprovalPoller {
  constructor(
    private readonly config: { baseUrl: string; token?: string; intervalMs: number },
    now: () => number = Date.now,
  ) {
    void now;
  }

  async pollUntil(jobId: string, fingerprint: string, timeoutMs: number, signal: AbortSignal): Promise<DecisionResult | undefined> {
    const deadline = Date.now() + timeoutMs;
    const headers: Record<string, string> = { accept: "application/json" };
    if (this.config.token) headers.authorization = `Bearer ${this.config.token}`;

    while (!signal.aborted && Date.now() < deadline) {
      try {
        const response = await fetch(
          `browser-jobs/${encodeURIComponent(jobId)}/approvals/${encodeURIComponent(fingerprint)}`,
          { headers, signal, method: "GET" },
        );
        if (response.ok) {
          const body = (await response.json().catch(() => null)) as
            | { decision?: string; decidedBy?: string; decidedAt?: string }
            | null;
          if (body && (body.decision === "approved" || body.decision === "rejected")) {
            return { decision: body.decision, source: "poll", decidedBy: body.decidedBy, decidedAt: body.decidedAt };
          }
        }
      } catch {
        // transient failure — keep polling until the deadline
      }
      await this.sleepBandInterval(signal);
    }
    return undefined;
  }

  private async sleepBandInterval(signal: AbortSignal): Promise<void> {
    const started = Date.now();
    const interval = this.config.intervalMs;
    while (Date.now() - started < interval && !signal.aborted) {
      await new Promise<void>((resolve) => setTimeout(resolve, Math.min(200, interval - (Date.now() - started))));
    }
  }
}

/** Minimal shape used by ApprovalCoordination — implemented by the runner. */
export type Emitter = (type: StepEventType, data: Record<string, unknown>) => Promise<void>;
type StepEventType = "job.approval.requested" | "job.approval.resolved";

export interface ApprovalRequestInput {
  jobId: string;
  organisationId: string;
  agentId: string;
  stepIndex: number;
  kind: StepKind;
  /** Convenience summary (e.g. "submit form → vendor-portal.example.com"). */
  summary: string;
  /** Binding input, hashed with actionFingerprint(...) before calls. */
  fingerprint: string;
  timeoutMs: number;
}
