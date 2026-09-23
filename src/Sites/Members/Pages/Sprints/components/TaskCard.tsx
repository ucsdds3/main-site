import { useRef } from "react";
import { twMerge } from "src/Utils/cn";

import { formatTaskDate, isTaskDueOverdue, teamAccent, teamLabel } from "../constants";
import type { SprintTaskRow } from "../types";

type TaskCardProps = {
  task: SprintTaskRow;
  showTeam?: boolean;
  canEdit: boolean;
  compact?: boolean;
  onEdit: () => void;
  onDragStart?: (task: SprintTaskRow) => void;
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
  compact,
  onEdit,
  onDragStart,
}: TaskCardProps) {
  const dragged = useRef(false);
  const accent = teamAccent(task.team_key);
  const names =
    task.assignees.length === 0 ? "Unassigned" : task.assignees.map(a => a.full_name).join(", ");
  const hours =
    task.actual_hours != null
      ? `${task.expected_hours}h expected · ${task.actual_hours}h actual`
      : `${task.expected_hours}h expected`;
  const overdue = isTaskDueOverdue(task);

  return (
    <article
      draggable={canEdit}
      onDragStart={e => {
        dragged.current = true;
        e.dataTransfer.setData("text/plain", String(task.id));
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(task);
      }}
      onDragEnd={() => {
        window.setTimeout(() => {
          dragged.current = false;
        }, 0);
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
      onClick={
        canEdit
          ? () => {
              if (dragged.current) return;
              onEdit();
            }
          : undefined
      }
    >
      <h3 className="m-0 text-[0.95rem] font-semibold leading-snug text-(--obs-text-primary)">
        {task.title}
      </h3>

      <div className="mt-2.5 flex flex-col gap-1.5">
        <MetaRow label="Who">{names}</MetaRow>
        {showTeam ? <MetaRow label="Team">{teamLabel(task.team_key)}</MetaRow> : null}
        <MetaRow label="Hours">{hours}</MetaRow>
        {task.expected_completion_on ? (
          <p className="m-0 flex min-w-0 items-baseline gap-2 text-[0.72rem] leading-5">
            <span className="w-16 shrink-0 font-mono text-[0.58rem] uppercase tracking-widest text-(--obs-text-faint)">
              Due
            </span>
            <span className="min-w-0 truncate text-(--obs-text-muted)">
              {formatTaskDate(task.expected_completion_on)}
              {overdue ? " · overdue" : ""}
            </span>
          </p>
        ) : null}
        {task.reviewer ? <MetaRow label="Review">{task.reviewer.full_name}</MetaRow> : null}
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
        {!compact && task.description ? (
          <p className="mb-0 mt-1 line-clamp-3 text-sm leading-5 text-(--obs-text-muted)">
            {task.description}
          </p>
        ) : null}
      </div>
    </article>
  );
}
