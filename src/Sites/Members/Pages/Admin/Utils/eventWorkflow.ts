/** Event ops pipeline status (DB values). Public /events only shows `complete`. */
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
