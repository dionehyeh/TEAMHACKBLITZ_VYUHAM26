import type { BrowserPermissionLevel } from "@bizcontext/types";
import type { StepKind } from "../contracts";

/**
 * Browser permission matrix (IMPLEMENTATION.md Section 5.3).
 *
 *   Level  Meaning
 *   B0     No browser — internal knowledge-only agents.
 *   B1     Read-only browsing (research public pages).
 *   B2     Interactive browsing (search, navigate, fill non-submitted forms).
 *   B3     Approved execution (submit forms / authorised changes after approval).
 *   B4     Restricted automation (superset of B3 for pre-approved recurring work).
 *
 * Default to B1; higher levels are granted per agent in the agent registry
 * (producer side). The worker NEVER decides scope itself — it only enforces
 * the level carried in the job payload.
 */

export type PolicyBlockCode =
  | "policy_denied_B0"
  | "browser_policy_insufficient"
  | "interactivity_requires_B2"
  | "downloads_requires_B2"
  | "execution_requires_B3";

export type StepDecision =
  | { decision: "allow" }
  | { decision: "require_approval" }
  | { decision: "block"; code: PolicyBlockCode; reason: string };

const LEVEL_ORDER: Record<BrowserPermissionLevel, number> = { B0: 0, B1: 1, B2: 2, B3: 3, B4: 4 };

export function levelAtLeast(level: BrowserPermissionLevel, minimum: BrowserPermissionLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[minimum];
}

const READ_ACTIONS: ReadonlySet<StepKind> = new Set([
  "navigate",
  "wait",
  "read_text",
  "extract_items",
  "screenshot",
]);

const INTERACTIVE_ACTIONS: ReadonlySet<StepKind> = new Set(["click", "fill", "select_option", "press_key"]);

/** Consequential actions — never autonomous. */
const EXECUTION_ACTIONS: ReadonlySet<StepKind> = new Set(["submit", "upload_file"]);

export function evaluateStepPolicy(kind: StepKind, level: BrowserPermissionLevel): StepDecision {
  if (level === "B0") {
    return {
      decision: "block",
      code: "policy_denied_B0",
      reason: "Permission level B0 disallows all browser execution.",
    };
  }
  if (READ_ACTIONS.has(kind)) return { decision: "allow" };

  if (INTERACTIVE_ACTIONS.has(kind)) {
    return levelAtLeast(level, "B2")
      ? { decision: "allow" }
      : {
          decision: "block",
          code: "interactivity_requires_B2",
          reason: "Interactive browser actions (click/type/select) require permission level B2.",
        };
  }

  if (kind === "download") {
    return levelAtLeast(level, "B2")
      ? { decision: "allow" }
      : {
          decision: "block",
          code: "downloads_requires_B2",
          reason: "File downloads require permission level B2 or higher.",
        };
  }

  if (EXECUTION_ACTIONS.has(kind)) {
    return levelAtLeast(level, "B3")
      ? { decision: "require_approval" }
      : {
          decision: "block",
          code: "execution_requires_B3",
          reason: "Form submissions and file uploads require permission level B3/B4 plus human approval.",
        };
  }

  throw new Error(`Unhandled step kind: ${kind as string}`);
}
