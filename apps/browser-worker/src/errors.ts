/**
 * Typed error taxonomy for the browser worker. JobRunner.classify() maps
 * every thrown error onto a terminal job status (completed / failed /
 * cancelled / blocked / expired) per IMPLEMENTATION.md Section 5.6.
 */

import { z } from "zod";
import type { UrlGuardCode } from "./policy/url-guard";
import type { PolicyBlockCode } from "./policy/permission-matrix";
import type { BrowserPermissionLevel } from "@bizcontext/types";

// Runtime policy codes used in PolicyViolationError constructor
export type RuntimePolicyCode =
  | "approval_denied"
  | "approval_timeout"
  | "staging_file_invalid"
  | "secret_unavailable"
  | "unsupported_secret_resolver"
  | "executable_file_blocked"
  | "executable_download_blocked"
  | "download_limit_exceeded"
  | "download_size_exceeded"
  | "step_limit_exceeded";

export class BrowserWorkerError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

/**
 * A step or navigation was rejected by the guard/policy layer.
 * `blocked` distinguishes policy rejections (job state "blocked") from
 * execution failures (job state "failed").
 */
export class PolicyViolationError extends BrowserWorkerError {
  readonly blocked: boolean;

  constructor(
    code: RuntimePolicyCode | import("./policy/permission-matrix").PolicyBlockCode,
    message: string,
    options: { blocked?: boolean } = {},
  ) {
    super(code, message);
    this.blocked = options.blocked ?? false;
  }
}

export type BrowserWorkerConfig = {
  env: "development" | "test" | "production";
  logLevel: "debug" | "info" | "warn" | "error";
  redisUrl: string;
  controlPlanePort: number;
  queueName: string;
  concurrency: number;
  headless: boolean;
  chromiumNoSandbox: boolean;
  stepTimeoutMs: number;
  jobTimeoutMs: number;
  maxTextBytes: number;
  maxDownloadBytes: number;
  maxUploadBytes: number;
  artifactDir: string;
  stagingDir: string;
  evidenceRetentionHours: number;
  defaultAllowedDomains: string[];
  approvalApiUrl?: string;
  approvalApiToken?: string;
  secretEnvPrefix: string;
  debugTracing: boolean;
};

/** Step policy decision result. */
export type StepDecision = {
  decision: "allow" | "block" | "require_approval";
  code?: string;
  reason: string;
};

/** Zod schema for JobPayload validation (re-exported from contracts). */
export const PermissionLevelSchema = z.enum(["B0", "B1", "B2", "B3", "B4"]) satisfies z.ZodType<BrowserPermissionLevel>;

export class ApprovalTimeoutError extends BrowserWorkerError {
  constructor(message: string) {
    super("approval_timeout", message);
  }
}

export class CancelledError extends BrowserWorkerError {
  readonly reason: string;

  constructor(reason: string) {
    super("cancelled", reason);
    this.reason = reason;
  }
}

export class BrowserUnavailableError extends BrowserWorkerError {
  constructor(message: string) {
    super("browser_unavailable", message);
  }
}

export class StepExecutionError extends BrowserWorkerError {
  readonly stepIndex: number;

  constructor(stepIndex: number, message: string) {
    super("step_failed", message);
    this.stepIndex = stepIndex;
  }
}