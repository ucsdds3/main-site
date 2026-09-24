import {
  fallbackBoardTeamCatalog,
  labelToTeamKey,
  teamKeyToLabel,
} from "src/Sites/Main/Pages/Board/boardTeamConfig";
import type { BoardTeamCatalogEntry } from "src/Sites/Main/Pages/Board/boardTeamTypes";

import type { SprintStatus, SprintTaskStatus } from "./types";

/** Static catalog fallback until sprints wires live BoardTeams fetch. */
export const SPRINT_TEAM_CATALOG = fallbackBoardTeamCatalog();

export const BOARD_TEAM_KEYS = SPRINT_TEAM_CATALOG.map(t => t.team_key);

export const BOARD_TEAM_OPTIONS = SPRINT_TEAM_CATALOG.map(t => ({
  key: t.team_key,
  label: t.label,
}));

export const SPRINT_TASK_STATUS_VALUES = ["todo", "in_progress", "pending_review", "done"] as const;

export const SPRINT_TASK_STATUS_LABELS: Record<SprintTaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  pending_review: "Pending review",
  done: "Complete",
  cancelled: "Dropped",
};

export const SPRINT_BOARD_COLUMNS = [
  { status: "todo" as const, label: "To do" },
  { status: "in_progress" as const, label: "In progress" },
  { status: "pending_review" as const, label: "Pending review" },
  { status: "done" as const, label: "Complete" },
];

export const MIN_TASK_DESCRIPTION_LENGTH = 20;
export const MAX_EXPECTED_HOURS = 5;
export const COLUMN_TASK_PREVIEW = 10;

export const TEAM_ACCENT: Record<string, string> = {
  EXECUTIVE: "#19B5CA",
  INTERNAL: "#818cf8",
  EXTERNAL: "#F58134",
  FINANCE: "#4ade80",
  SOFTWARE: "#60a5fa",
  PROJECTS: "#fbbf24",
  CONSULTING: "#e879f9",
  MARKETING: "#fb7185",
  WORKSHOPS: "#2dd4bf",
  PROFESSIONAL_EVENTS: "#fb923c",
  SOCIAL_EVENTS: "#c084fc",
  ONLINE_CONTENT: "#38bdf8",
  DATAHACKS: "#f472b6",
  ADVISORS: "#94a3b8",
};

export const COLUMN_ACCENT: Record<(typeof SPRINT_BOARD_COLUMNS)[number]["status"], string> = {
  todo: "#94a3b8",
  in_progress: "#19B5CA",
  pending_review: "#F58134",
  done: "#4ade80",
};

export function teamAccent(teamKey: string): string {
  return TEAM_ACCENT[teamKey] ?? "#19B5CA";
}

export function isOpenSprintTaskStatus(status: SprintTaskStatus): boolean {
  return status === "todo" || status === "in_progress" || status === "pending_review";
}

export const SPRINT_STATUS_LABELS: Record<SprintStatus, string> = {
  planning: "Planning",
  active: "Active",
  closed: "Closed",
};

export function teamLabel(
  teamKey: string,
  catalog: BoardTeamCatalogEntry[] = SPRINT_TEAM_CATALOG
): string {
  return teamKeyToLabel(teamKey, catalog);
}

/** Filter chips: every catalog team, plus any stray keys still on tasks. */
export function sprintTeamTabKeys(
  catalog: BoardTeamCatalogEntry[],
  extraKeys: Iterable<string> = []
): string[] {
  const ordered = [...catalog]
    .sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label))
    .map(t => t.team_key);
  const seen = new Set(ordered);
  const extras: string[] = [];
  for (const key of extraKeys) {
    if (!key || seen.has(key)) continue;
    seen.add(key);
    extras.push(key);
  }
  return [...ordered, ...extras];
}

export function formatSprintDates(startsOn: string, endsOn: string): string {
  const start = new Date(`${startsOn}T00:00:00`);
  const end = new Date(`${endsOn}T00:00:00`);
  const fmt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  return `${start.toLocaleDateString("en-US", fmt)} – ${end.toLocaleDateString("en-US", fmt)}`;
}

export function formatTaskDate(isoDay: string): string {
  return new Date(`${isoDay}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function isTaskDueOverdue(task: {
  expected_completion_on: string | null;
  status: SprintTaskStatus;
}): boolean {
  if (!task.expected_completion_on) return false;
  if (task.status === "done" || task.status === "cancelled") return false;
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return task.expected_completion_on < `${y}-${m}-${d}`;
}

export function defaultTeamKey(teams: Record<string, string> | null | undefined): string {
  const first = Object.keys(teams ?? {})[0];
  return first ? labelToTeamKey(first) : (BOARD_TEAM_KEYS[0] ?? "EXECUTIVE");
}

export function memberTeamKeys(teams: Record<string, string> | null | undefined): string[] {
  return Object.keys(teams ?? {}).map(labelToTeamKey);
}

export function memberOnTeam(
  member: { teams: Record<string, string> | null | undefined },
  teamKey: string
): boolean {
  return memberTeamKeys(member.teams).includes(teamKey);
}

export function taskNeedsReviewer(task: {
  reviewer_id: number | null;
  reviewer?: { id: number } | null;
}): boolean {
  return task.reviewer_id != null || task.reviewer != null;
}
