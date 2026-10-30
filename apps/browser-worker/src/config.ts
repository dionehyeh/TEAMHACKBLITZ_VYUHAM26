import { z } from "zod";

/**
 * Browser Worker configuration.
 *
 * Every value is environment-driven (see apps/browser-worker/.env.example).
 * Parsing is strict: invalid values abort startup instead of silently
 * changing security limits (IMPLEMENTATION.md Section 11).
 */

export const APP_VERSION = "0.1.0";

const booleanSetting = (defaultValue: boolean) =>
  z
    .enum(["true", "false"])
    .default(defaultValue ? "true" : "false")
    .transform((value) => value === "true");

const intSetting = (defaultValue: number, min: number, max: number) =>
  z.coerce.number().int().min(min).max(max).default(defaultValue);

export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),

  BROWSER_WORKER_PORT: intSetting(3002, 1, 65535),
  BROWSER_QUEUE_NAME: z.string().min(1).default("browser-jobs"),
  BROWSER_WORKER_CONCURRENCY: intSetting(2, 1, 20),

  // Browser session behaviour.
  BROWSER_HEADLESS: booleanSetting(true),
  BROWSER_CHROMIUM_NO_SANDBOX: booleanSetting(false),
  BROWSER_TIMEOUT_MS: intSetting(30_000, 1_000, 120_000),
  BROWSER_JOB_TIMEOUT_MS: intSetting(180_000, 10_000, 900_000),
  BROWSER_MAX_TEXT_BYTES: intSetting(50_000, 500, 1_000_000),
  BROWSER_MAX_DOWNLOAD_BYTES: intSetting(10 * 1024 * 1024, 10_000, 200_000_000),
  BROWSER_MAX_UPLOAD_BYTES: intSetting(20 * 1024 * 1024, 1_000, 200_000_000),

  // Evidence stores.
  BROWSER_ARTIFACT_DIR: z.string().min(1).default("./artifacts"),
  BROWSER_STAGING_DIR: z.string().min(1).default("./staging"),
  BROWSER_EVIDENCE_RETENTION_HOURS: intSetting(24, 1, 720),

  // Policy fallback when a job payload omits `allowedDomains`.
  ALLOWED_DOMAINS_DEFAULT: z.string().default("google.com,github.com,wikipedia.org"),

  // Producer API (modules/browser-jobs) used to poll approval decisions.
  BROWSER_JOBS_API_URL: z.string().url().optional(),
  BROWSER_JOBS_API_TOKEN: z.string().min(1).optional(),

  // Secret resolution (env-only resolver in v1; vault resolver is a later phase).
  BROWSER_SECRET_ENV_PREFIX: z.string().min(1).default("BROWSER_SECRET_"),

  // Optional Playwright trace archives for debugging failed jobs.
  BROWSER_DEBUG_TRACING: booleanSetting(false),
});

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

export function parseDomainList(raw: string): string[] {
  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase().replace(/^"|"$/g, ""))
    .filter((entry) => entry.length > 0);
}

export function loadConfig(env: Record<string, string | undefined> = process.env): BrowserWorkerConfig {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid browser worker environment configuration: ${issues}`);
  }

  const raw = parsed.data;
  return {
    env: raw.NODE_ENV,
    logLevel: raw.LOG_LEVEL,
    redisUrl: raw.REDIS_URL,
    controlPlanePort: raw.BROWSER_WORKER_PORT,
    queueName: raw.BROWSER_QUEUE_NAME,
    concurrency: raw.BROWSER_WORKER_CONCURRENCY,
    headless: raw.BROWSER_HEADLESS,
    chromiumNoSandbox: raw.BROWSER_CHROMIUM_NO_SANDBOX,
    stepTimeoutMs: raw.BROWSER_TIMEOUT_MS,
    jobTimeoutMs: raw.BROWSER_JOB_TIMEOUT_MS,
    maxTextBytes: raw.BROWSER_MAX_TEXT_BYTES,
    maxDownloadBytes: raw.BROWSER_MAX_DOWNLOAD_BYTES,
    maxUploadBytes: raw.BROWSER_MAX_UPLOAD_BYTES,
    artifactDir: raw.BROWSER_ARTIFACT_DIR,
    stagingDir: raw.BROWSER_STAGING_DIR,
    evidenceRetentionHours: raw.BROWSER_EVIDENCE_RETENTION_HOURS,
    defaultAllowedDomains: parseDomainList(raw.ALLOWED_DOMAINS_DEFAULT),
    approvalApiUrl: raw.BROWSER_JOBS_API_URL,
    approvalApiToken: raw.BROWSER_JOBS_API_TOKEN,
    secretEnvPrefix: raw.BROWSER_SECRET_ENV_PREFIX,
    debugTracing: raw.BROWSER_DEBUG_TRACING,
  };
}
