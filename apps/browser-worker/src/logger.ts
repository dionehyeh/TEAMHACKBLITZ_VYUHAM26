/**
 * Structured JSON logging with automatic secret redaction.
 *
 * IMPLEMENTATION.md Section 11: "Redact credentials and sensitive payloads
 * from logs." Every log line and every published event passes through
 * redactValue() before it is written or published.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export type LogFields = Record<string, unknown>;

export interface Logger {
  debug(msg: string, fields?: LogFields): void;
  info(msg: string, fields?: LogFields): void;
  warn(msg: string, fields?: LogFields): void;
  error(msg: string, fields?: LogFields): void;
}

function resolveLevel(explicit: LogLevel | undefined): LogLevel {
  if (explicit) return explicit;
  const fromEnv = process.env.LOG_LEVEL;
  if (fromEnv === "debug" || fromEnv === "info" || fromEnv === "warn" || fromEnv === "error") {
    return fromEnv;
  }
  return "info";
}

export function createLogger(module: string, level?: LogLevel): Logger {
  const minLevel = resolveLevel(level);

  const emit = (lv: LogLevel, msg: string, fields?: LogFields): void => {
    if (LEVEL_WEIGHT[lv] < LEVEL_WEIGHT[minLevel]) return;
    const record: Record<string, unknown> = {
      ts: new Date().toISOString(),
      level: lv,
      service: "browser-worker",
      module,
      msg,
    };
    if (fields !== undefined) record.fields = redactValue(fields);
    const line = JSON.stringify(record);
    if (lv === "error") console.error(line);
    else if (lv === "warn") console.warn(line);
    else console.log(line);
  };

  return {
    debug: (msg, fields) => emit("debug", msg, fields),
    info: (msg, fields) => emit("info", msg, fields),
    warn: (msg, fields) => emit("warn", msg, fields),
    error: (msg, fields) => emit("error", msg, fields),
  };
}

const SECRET_KEY_PATTERN =
  /(password|passwd|secret|token|bearer|authorization|cookie|credential|apikey|api[-_]key|authentication)/i;

const REDACTED = "[REDACTED]";

function redactString(value: string): string {
  // http://user:pass@host → http://user:[REDACTED]@host
  return value.replace(/(https?):\/\/([^/:@\s"']+):([^@\s"']+)@/i, "$1://$2:[REDACTED]@");
}

/**
 * Recursively redacts secret-looking keys and URLs with embedded credentials.
 * `secretRef` keys are preserved because they are references (a resolver id
 * plus a key NAME), never the secret material itself.
 */
export function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 8) return "[DEPTH_LIMIT]";
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return redactString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map((item) => redactValue(item, depth + 1));
  if (value instanceof Error) return serializeError(value);
  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (key.toLowerCase() === "secretref") {
        output[key] = entry; // reference metadata, not a secret
        continue;
      }
      output[key] = SECRET_KEY_PATTERN.test(key) ? REDACTED : redactValue(entry, depth + 1);
    }
    return output;
  }
  return String(value);
}

export function serializeError(error: unknown): { name: string; message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message.length > 500 ? `${error.message.slice(0, 500)}…` : error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack?.split("\n").slice(0, 4).join("\n"),
    };
  }
  return { name: "UnknownError", message: String(error) };
}
