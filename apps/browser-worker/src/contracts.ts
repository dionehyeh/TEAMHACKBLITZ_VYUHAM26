/**
 * Core type schemas and type exports for the browser worker.
 * 
 * IMPORTANT: This file uses `@bizcontext/types` which has its own `rootDir`
 * setting in tsconfig.base.json. Type references from this file into the
 * browser-worker `rootDir` may cause the "not under rootDir" error, but the
 * type resolution should still work at runtime since the types are shared
 * across the monorepo via the path mappings.
 *
 * All types here are deliberately shared with the producer (modules/browser-jobs)
 * and consumer (API) teams via the wire contract.
 */

import { z } from "zod";
import type { BrowserPermissionLevel } from "@bizcontext/types";

// ---------------------------------------------------------------------------
// Permission levels
// ---------------------------------------------------------------------------

export const PermissionLevelSchema = z.enum(["B0", "B1", "B2", "B3", "B4"]) satisfies z.ZodType<BrowserPermissionLevel>;

// ---------------------------------------------------------------------------
// Job payload (queue message)
// ---------------------------------------------------------------------------

export type PermissionLevel = BrowserPermissionLevel;

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

export const STEP_KINDS = [
  "navigate",
  "wait",
  "read_text",
  "extract_items",
  "click",
  "fill",
  "select_option",
  "press_key",
  "submit",
  "upload_file",
  "download",
  "screenshot",
] as const;

export type StepKind = (typeof STEP_KINDS)[number];

// ---------------------------------------------------------------------------
// Step schemas
// ---------------------------------------------------------------------------

export const StepSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("navigate"),
    url: z.string().min(1),
    waitUntil: z.enum(["load", "domcontentloaded", "commit"]).default("domcontentloaded"),
  }),
  z.object({
    kind: z.literal("wait"),
    ms: z.number().int().min(0).max(60_000).optional(),
    selector: z.string().min(1).optional(),
  }),
  z.object({
    kind: z.literal("read_text"),
    selector: z.string().min(1).default("body"),
    maxChars: z.number().int().min(50).max(200_000).optional(),
  }),
  z.object({
    kind: z.literal("extract_items"),
    selector: z.string().min(1),
    fields: z.record(z.string().min(1), z.string().min(1)),
    limit: z.number().int().min(1).max(50).default(20),
  }),
  z.object({ kind: z.literal("click"), selector: z.string().min(1) }),
  z.object({
    kind: z.literal("fill"),
    selector: z.string().min(1),
    value: z.string().optional(),
    secretRef: z
      .object({
        resolver: z.enum(["env"]).default("env"),
        key: z.string().min(1),
      })
      .optional(),
  }),
  z.object({
    kind: z.literal("select_option"),
    selector: z.string().min(1),
    values: z.array(z.string()).min(1).max(50),
  }),
  z.object({
    kind: z.literal("press_key"),
    selector: z.string().min(1).optional(),
    key: z.enum(["Enter", "Escape", "Tab"]),
  }),
  z.object({
    kind: z.literal("submit"),
    selector: z.string().min(1).optional(),
    via: z.enum(["click", "press_enter"]).default("click"),
  }),
  z.object({
    kind: z.literal("upload_file"),
    selector: z.string().min(1),
    stagingPath: z.string().min(1),
  }),
  z.object({
    kind: z.literal("download"),
    triggerSelector: z.string().min(1).optional(),
  }),
  z.object({
    kind: z.literal("screenshot"),
    fullPage: z.boolean().default(false),
  }),
]);

export type Step = z.infer<typeof StepSchema>;

// ---------------------------------------------------------------------------
// Job payload
// ---------------------------------------------------------------------------

export const LIMITS_DEFAULTS = {
  maxSteps: 50,
  stepTimeoutMs: 30_000,
  approvalTimeoutMs: 120_000,
  maxDownloads: 3,
} as const;

export const LimitsSchema = z.object({
  maxSteps: z.number().int().min(1).max(200).default(LIMITS_DEFAULTS.maxSteps),
  stepTimeoutMs: z.number().int().min(1_000).max(120_000).default(LIMITS_DEFAULTS.stepTimeoutMs),
  approvalTimeoutMs: z.number().int().min(5_000).max(600_000).default(LIMITS_DEFAULTS.approvalTimeoutMs),
  maxDownloads: z.number().int().min(0).max(10).default(LIMITS_DEFAULTS.maxDownloads),
});

export type JobLimits = z.infer<typeof LimitsSchema>;

export const JobPayloadSchema = z
  .object({
    contractVersion: z.literal(1).default(1),
    jobId: z.string().uuid(),
    organisationId: z.string().min(1).max(128),
    agentId: z.string().min(1).max(128),
    agentVersion: z.string().min(1).max(64).optional(),
    requestedByUserId: z.string().min(1).max(128),
    goal: z.string().min(1).max(2_000),
    permissionLevel: PermissionLevelSchema,
    targetUrl: z.string().url(),
    allowedDomains: z.array(z.string().min(1)).max(50).optional(),
    steps: z.array(StepSchema).min(1).max(200),
    limits: LimitsSchema.optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .superRefine((value, ctx) => {
    value.steps.forEach((step, index) => {
      const path = ["steps", index] as const;
      if (step.kind === "wait" && step.ms === undefined && step.selector === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [...path],
          message: "wait step requires 'ms' and/or 'selector'",
        });
      }
      if (step.kind === "fill") {
        const parts = (step.value !== undefined ? 1 : 0) + (step.secretRef !== undefined ? 1 : 0);
        if (parts !== 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [...path],
            message: "fill step requires exactly one of 'value' or 'secretRef'",
          });
        }
      }
    });
  });

export type JobPayload = z.infer<typeof JobPayloadSchema>;

// ---------------------------------------------------------------------------
// Artifacts
// ---------------------------------------------------------------------------

export const ArtifactSchema = z.object({
  kind: z.enum(["screenshot", "download", "trace"]),
  filename: z.string().min(1),
  path: z.string().min(1),
  sha256: z.string().length(64),
  bytes: z.number().int().min(0),
  createdAt: z.string().min(1),
});

export type Artifact = z.infer<typeof ArtifactSchema>;

// ---------------------------------------------------------------------------
// Observations
// ---------------------------------------------------------------------------

export const ObservationSchema = z.object({
  stepIndex: z.number().int().min(0),
  kind: z.string().min(1),
  data: z.unknown(),
  capturedAt: z.string().min(1),
  truncated: z.boolean(),
});

export type Observation = z.infer<typeof ObservationSchema>;

// ---------------------------------------------------------------------------
// Action log
// ---------------------------------------------------------------------------

export const ActionLogEntrySchema = z.object({
  stepIndex: z.number().int().min(0),
  kind: z.string().min(1),
  status: z.enum(["ok", "failed", "blocked", "awaiting_approval"]),
  params: z.record(z.string(), z.unknown()),
  startedAt: z.string().min(1),
  finishedAt: z.string().min(1),
  note: z.string().max(500).optional(),
});

export type ActionLogEntry = z.infer<typeof ActionLogEntrySchema>;

// ---------------------------------------------------------------------------
// Job result
// ---------------------------------------------------------------------------

export const FinalStatusSchema = z.enum(["completed", "failed", "cancelled", "blocked", "expired"]);
export type FinalStatus = z.infer<typeof FinalStatusSchema>;

export const JobResultSchema = z.object({
  contractVersion: z.literal(1),
  jobId: z.string(),
  organisationId: z.string(),
  agentId: z.string(),
  agentVersion: z.string().optional(),
  requestedByUserId: z.string().optional(),
  status: FinalStatusSchema,
  terminationReason: z.string().max(64).optional(),
  message: z.string().max(500).optional(),
  startedAt: z.string().min(1),
  finishedAt: z.string().min(1),
  durationMs: z.number().int().min(0),
  stepsRequested: z.number().int().min(0),
  stepsExecuted: z.number().int().min(0),
  observations: z.array(ObservationSchema).max(400),
  actionLog: z.array(ActionLogEntrySchema).max(400),
  artifacts: z.array(ArtifactSchema).max(50),
  error: z.string().max(2_000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type JobResult = z.infer<typeof JobResultSchema>;

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export const EVENT_TYPES = [
  "job.received",
  "job.status",
  "job.step.started",
  "job.step.completed",
  "job.step.blocked",
  "job.step.failed",
  "job.navigation.blocked",
  "job.approval.requested",
  "job.approval.resolved",
  "job.artifact.captured",
  "job.completed",
  "job.failed",
  "job.blocked",
  "job.expired",
  "job.cancelled",
] as const;

export type EventName = (typeof EVENT_TYPES)[number];

export const EventSchema = z.object({
  seq: z.number().int().min(1),
  ts: z.string().min(1),
  jobId: z.string().min(1),
  type: z.enum(EVENT_TYPES),
  data: z.record(z.string(), z.unknown()).default({}),
});

export type BrowserWorkerEvent = z.infer<typeof EventSchema>;

// ---------------------------------------------------------------------------
// Control messages
// ---------------------------------------------------------------------------

export const ApprovalDecisionSchema = z.object({
  jobId: z.string().min(1),
  fingerprint: z.string().length(64),
  decision: z.enum(["approved", "rejected"]),
  decidedBy: z.string().max(128).optional(),
  decidedAt: z.string().optional(),
  note: z.string().max(500).optional(),
});

export type ApprovalDecisionMessage = z.infer<typeof ApprovalDecisionSchema>;

export const CancelMessageSchema = z.object({
  jobId: z.string().min(1),
  reason: z.string().max(200).optional(),
  requestedBy: z.string().max(128).optional(),
});

export type CancelMessage = z.infer<typeof CancelMessageSchema>;

// ---------------------------------------------------------------------------
// Termination reasons
// ---------------------------------------------------------------------------

export const TERMINATION_REASONS = [
  "policy_denied_B0",
  "browser_policy_insufficient",
  "interactivity_requires_B2",
  "downloads_requires_B2",
  "execution_requires_B3",
  "navigation_blocked",
  "invalid_url",
  "disallowed_scheme",
  "unknown_host",
  "host_not_allowlisted",
  "ip_literal_blocked",
  "private_address_blocked",
  "dns_resolution_failed",
  "step_limit_exceeded",
  "download_limit_exceeded",
  "download_size_exceeded",
  "executable_download_blocked",
  "executable_file_blocked",
  "staging_file_invalid",
  "secret_unavailable",
  "unsupported_secret_resolver",
  "step_failed",
  "invalid_payload",
  "browser_unavailable",
  "duplicate_execution",
  "approval_denied",
  "approval_timeout",
  "user_cancelled",
  "job_timeout",
  "worker_shutdown",
  "internal_error",
] as const;

export type TerminationReason = (typeof TERMINATION_REASONS)[number];

// ---------------------------------------------------------------------------
// Exported types used across the wire
// ---------------------------------------------------------------------------