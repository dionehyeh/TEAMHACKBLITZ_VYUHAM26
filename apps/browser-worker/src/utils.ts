/** Small shared utilities. */

import { createHash } from "node:crypto";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function sha256Hex(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Real browser-safety logging of a URL: origin + pathname only.
 * Query strings and fragments are stripped before anything is logged or
 * published because they frequently carry session tokens. */
export function safeUrlForLogging(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    return `${url.origin}${url.pathname}`;
  } catch {
    return "(unparseable url)";
  }
}

export function safeUrlHost(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname;
  } catch {
    return "(unparseable host)";
  }
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max))}…[TRUNCATED]`;
}

export function padIndex(index: number, width = 3): string {
  return String(index).padStart(width, "0");
}

const FILENAME_SAFE = /[^a-zA-Z0-9._-]/g;

export function sanitizeSegment(value: string, max = 80): string {
  return value.replace(FILENAME_SAFE, "_").slice(0, Math.max(1, max));
}

export function sanitizeFilename(value: string, max = 120): string {
  const cleaned = value.replace(/[/\\]/g, "_").replace(FILENAME_SAFE, "_").trim();
  return cleaned.length > 0 ? cleaned.slice(0, max) : "unnamed";
}
