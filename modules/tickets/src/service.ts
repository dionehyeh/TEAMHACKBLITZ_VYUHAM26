/**
 * Domain Service & Utilities for Tickets, SLA & Internal Requests
 *
 * Mapped to IMPLEMENTATION.md Sections 2.7, 8.3, 10.3, and 11.
 */

export const TICKET_CATEGORIES = [
  "it",
  "access",
  "infrastructure",
  "hr",
  "design",
  "dev",
  "finance",
  "general",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_STATUSES = [
  "open",
  "assigned",
  "acknowledged",
  "in_progress",
  "waiting",
  "resolved",
  "closed",
  "reopened",
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

/**
 * Calculates default SLA deadline based on priority (Section 2.7 & 10.3)
 */
export function calculateSlaTarget(priority: TicketPriority): { targetDate: Date; humanLabel: string } {
  const now = new Date();
  const targetDate = new Date(now.getTime());

  switch (priority) {
    case "urgent":
      targetDate.setHours(targetDate.getHours() + 4);
      return { targetDate, humanLabel: "In 4 hours" };
    case "high":
      targetDate.setHours(targetDate.getHours() + 12);
      return { targetDate, humanLabel: "In 12 hours" };
    case "medium":
      targetDate.setHours(targetDate.getHours() + 24);
      return { targetDate, humanLabel: "In 24 hours" };
    case "low":
    default:
      targetDate.setHours(targetDate.getHours() + 72);
      return { targetDate, humanLabel: "In 72 hours" };
  }
}

/**
 * Check if an SLA has been breached.
 * A ticket's SLA is breached if current time is past the SLA target and the ticket is not resolved or closed.
 */
export function isSlaBreached(
  slaTarget: string | Date | null | undefined,
  status: TicketStatus | string
): boolean {
  if (!slaTarget) return false;
  if (status === "resolved" || status === "closed") return false;

  const deadline = typeof slaTarget === "string" ? new Date(slaTarget).getTime() : slaTarget.getTime();
  if (Number.isNaN(deadline)) return false;

  return Date.now() > deadline;
}

/**
 * Generates formatted human-readable ticket numbers like TICK-1045
 */
export function formatTicketNumber(indexOrCounter: number): string {
  return `TICK-${indexOrCounter}`;
}

/**
 * AI-assisted category routing suggestions (Section 2.7)
 */
export function suggestCategoryDepartment(category: TicketCategory): string {
  switch (category) {
    case "infrastructure":
    case "dev":
      return "AI Engineering & Research";
    case "it":
    case "access":
      return "IT & Security Operations";
    case "hr":
      return "People & Culture";
    case "finance":
      return "Finance & Corporate Ops";
    case "design":
      return "Product & Design";
    case "general":
    default:
      return "General Administration";
  }
}
