/** Event ops pipeline status (DB values). */
export const EVENT_WORKFLOW_STATUS_VALUES = [
  "none",
  "waiting_room",
  "waiting_finance",
  "waiting_marketing",
  "complete",
] as const;

export type EventWorkflowStatus = (typeof EVENT_WORKFLOW_STATUS_VALUES)[number];

export const EVENT_WORKFLOW_STATUS_LABELS: Record<EventWorkflowStatus, string> = {
  none: "None",
  waiting_room: "Waiting for room booking",
  waiting_finance: "Waiting for finance",
  waiting_marketing: "Waiting for marketing",
  complete: "Complete",
};

/**
 * Statuses visible on public /events and the ICS calendar feed.
 * Published once marketing handoff starts (`waiting_marketing`) or when Complete.
 */
export const PUBLIC_EVENT_WORKFLOW_STATUSES: readonly EventWorkflowStatus[] = [
  "waiting_marketing",
  "complete",
] as const;

export function isPublicEventWorkflowStatus(value: unknown): boolean {
  return (
    typeof value === "string" &&
    (PUBLIC_EVENT_WORKFLOW_STATUSES as readonly string[]).includes(value)
  );
}

/** Statuses that trigger an email on Confirm. */
export const EVENT_WORKFLOW_NOTIFY_STATUSES: ReadonlySet<EventWorkflowStatus> = new Set([
  "waiting_room",
  "waiting_finance",
  "waiting_marketing",
]);

export const EVENT_WORKFLOW_NOTIFY_RECIPIENT_LABEL: Record<
  "waiting_room" | "waiting_finance" | "waiting_marketing",
  string
> = {
  waiting_room: "VPI",
  waiting_finance: "VPF",
  waiting_marketing: "Director of Marketing",
};

export function isEventWorkflowStatus(value: unknown): value is EventWorkflowStatus {
  return (
    typeof value === "string" &&
    (EVENT_WORKFLOW_STATUS_VALUES as readonly string[]).includes(value)
  );
}

export function formatEventWorkflowStatus(value: unknown): string {
  if (value === null || value === undefined || value === "") return "None";
  if (isEventWorkflowStatus(value)) return EVENT_WORKFLOW_STATUS_LABELS[value];
  return String(value);
}

export function eventWorkflowStatusFromLabel(label: string): EventWorkflowStatus | null {
  const entry = Object.entries(EVENT_WORKFLOW_STATUS_LABELS).find(([, l]) => l === label);
  return entry ? (entry[0] as EventWorkflowStatus) : null;
}

export function eventWorkflowStatusConfirmMessage(status: EventWorkflowStatus): string {
  const label = formatEventWorkflowStatus(status);
  if (status === "waiting_marketing") {
    return 'Set status to "Waiting for marketing", email Director of Marketing, and publish this event on the public events page?';
  }
  if (EVENT_WORKFLOW_NOTIFY_STATUSES.has(status)) {
    const role =
      EVENT_WORKFLOW_NOTIFY_RECIPIENT_LABEL[
        status as "waiting_room" | "waiting_finance" | "waiting_marketing"
      ];
    return `Set status to "${label}" and email ${role}?`;
  }
  if (status === "complete") {
    return 'Set status to "Complete"? (Already public once Waiting for marketing; this marks ops as done.)';
  }
  return `Set status to "${label}"?`;
}
