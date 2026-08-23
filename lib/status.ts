import type { BadgeProps } from "@/components/ui/badge";

type Variant = NonNullable<BadgeProps["variant"]>;

const map: Record<string, Variant> = {
  // Client
  LEAD: "info",
  ACTIVE: "sage",
  PAST: "neutral",
  ON_HOLD: "ochre",

  // Project
  ENQUIRY: "info",
  DESIGN: "primary",
  APPROVAL: "ochre",
  EXECUTION: "primary",
  HANDOVER: "sage",
  COMPLETED: "sage",
  CANCELLED: "danger",

  // Milestone
  PENDING: "neutral",
  IN_PROGRESS: "primary",
  DONE: "sage",
  DELAYED: "danger",

  // Transaction
  PAID: "sage",
  OVERDUE: "danger",

  // Agreement
  DRAFT: "neutral",
  SENT: "info",
  SIGNED: "sage",
  EXPIRED: "danger",

  // Quotation
  ACCEPTED: "sage",
  REJECTED: "danger",
};

export function statusVariant(status: string): Variant {
  return map[status] ?? "neutral";
}
