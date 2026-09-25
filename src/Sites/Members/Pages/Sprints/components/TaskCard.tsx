import { useState } from "react";
import { twMerge } from "src/Utils/cn";

import { firstName, formatTaskDate, isTaskDueOverdue, teamAccent, teamLabel } from "../constants";
import type { SprintTaskRow } from "../types";

type TaskCardProps = {
  task: SprintTaskRow;
  showTeam?: boolean;
  canEdit: boolean;
  compact?: boolean;
  nudging?: boolean;
  sprintNames?: string[];
  onEdit: () => void;
  onDragStart?: (task: SprintTaskRow) => void;
  onNudge?: (task: SprintTaskRow) => void;
};

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="m-0 flex min-w-0 items-baseline gap-2 text-[0.72rem] leading-5">
      <span className="w-16 shrink-0 font-mono text-[0.58rem] uppercase tracking-widest text-(--obs-text-faint)">
        {label}
      </span>
      <span className="min-w-0 truncate text-(--obs-text-muted)">{children}</span>
    </p>
  );
}

export default function TaskCard({
  task,
  showTeam,
  canEdit,
  compact = true,
  nudging,
  sprintNames,
  onEdit,
  onDragStart,
  onNudge,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(!compact);
  const accent = teamAccent(task.team_key);
  const names =
    task.assignees.length === 0
      ? "Unassigned"
      : task.assignees.map(a => firstName(a.full_name)).join(", ");
  const hours =
    task.actual_hours != null
      ? `${task.expected_hours}h expected · ${task.actual_hours}h actual`
      : `${task.expected_hours}h expected`;
  const overdue = isTaskDueOverdue(task);
  const assigner = task.creator?.full_name ?? "Unknown";

  return (
    <article
      draggable={canEdit}
      onDragStart={e => {
        e.dataTransfer.setData("text/plain", String(task.id));
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(task);
      }}
      className={twMerge(
        "rounded-xl border p-3.5",
        overdue
          ? "border-[rgba(248,113,113,0.7)] bg-[rgba(127,29,29,0.42)]"
          : "border-(--obs-border) bg-[rgba(8,14,25,0.92)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]",
        canEdit && "cursor-grab hover:brightness-110 active:cursor-grabbing"
      )}
      style={{
        borderLeftWidth: 4,
        borderLeftColor: overdue ? "#f87171" : accent,
        boxShadow: overdue
          ? "0 0 0 1px rgba(248,113,113,0.28), 0 10px 24px rgba(248,113,113,0.18)"
          : `0 0 0 1px ${accent}22, 0 10px 24px ${accent}10`,
      }}
    >
      <h3 className="m-0 text-[0.95rem] font-semibold leading-snug text-(--obs-text-primary)">
        {task.title}
      </h3>
      {expanded ? null : (
        <p className="mb-0 mt-1.5 truncate text-[0.78rem] text-(--obs-text-muted)">{names}</p>
      )}

      {expanded ? (
        <div className="mt-2.5 flex flex-col gap-1.5">
          <MetaRow label="Assigner">{assigner}</MetaRow>
          <MetaRow label="Assignee">{names}</MetaRow>
          <MetaRow label="Reviewer">{task.reviewer?.full_name ?? "None"}</MetaRow>
          {showTeam ? <MetaRow label="Team">{teamLabel(task.team_key)}</MetaRow> : null}
          {sprintNames?.length ? <MetaRow label="Sprint">{sprintNames.join(", ")}</MetaRow> : null}
          <MetaRow label="Hours">{hours}</MetaRow>
          {task.expected_completion_on ? (
            <MetaRow label="Due">
              {formatTaskDate(task.expected_completion_on)}
              {overdue ? " · overdue" : ""}
            </MetaRow>
          ) : null}
          {task.relevant_url ? (
            <p className="m-0 flex min-w-0 items-baseline gap-2 text-[0.72rem] leading-5">
              <span className="w-16 shrink-0 font-mono text-[0.58rem] uppercase tracking-widest text-(--obs-text-faint)">
                Link
              </span>
              <a
                href={task.relevant_url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 truncate text-[#19B5CA]"
                onClick={e => e.stopPropagation()}
              >
                Open
              </a>
            </p>
          ) : null}
          {task.progress_notes?.trim() ? (
            <p className="mb-0 mt-1 line-clamp-4 whitespace-pre-wrap text-sm leading-5 text-(--obs-text-muted)">
              {task.progress_notes}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(open => !open);
          }}
          className="cursor-pointer rounded-full border border-(--obs-border) bg-transparent px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-widest text-(--obs-text-muted)"
        >
          {expanded ? "Hide details" : "Details"}
        </button>
        {canEdit ? (
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            className="cursor-pointer rounded-full border border-(--obs-border) bg-transparent px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-widest text-[#19B5CA]"
          >
            Edit
          </button>
        ) : null}
        {overdue && onNudge ? (
          <button
            type="button"
            disabled={nudging}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onNudge(task);
            }}
            className="cursor-pointer rounded-full border border-[rgba(248,113,113,0.45)] bg-[rgba(248,113,113,0.12)] px-2.5 py-0.5 font-mono text-[0.58rem] uppercase tracking-widest text-[#fca5a5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {nudging ? "Sending…" : "Nudge"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
