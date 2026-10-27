import { twMerge } from "src/Utils/cn";

import { formatSprintDates, SPRINT_STATUS_LABELS, sprintTiming, todayIso } from "../constants";
import type { SprintRow } from "../types";

type SprintSwitcherProps = {
  sprints: SprintRow[];
  selectedId: number | null;
  onSelect: (sprint: SprintRow) => void;
  onCreate?: () => void;
  allTime?: boolean;
  onAllTimeChange?: (allTime: boolean) => void;
};

function optionLabel(sprint: SprintRow, timing: ReturnType<typeof sprintTiming>) {
  const label = `${sprint.name} · ${formatSprintDates(sprint.starts_on, sprint.ends_on)}`;
  // Flag a status that disagrees with the dates, e.g. an old sprint nobody closed.
  const expected = timing === "past" ? "closed" : timing === "upcoming" ? "planning" : null;
  const mismatch = expected ? sprint.status !== expected : sprint.status === "closed";
  return mismatch ? `${label} (${SPRINT_STATUS_LABELS[sprint.status]})` : label;
}

export default function SprintSwitcher({
  sprints,
  selectedId,
  onSelect,
  onCreate,
  allTime,
  onAllTimeChange,
}: SprintSwitcherProps) {
  // Group by dates relative to today: current, then upcoming soonest first, then past newest first.
  const today = todayIso();
  const byStart = [...sprints].sort(
    (a, b) => a.starts_on.localeCompare(b.starts_on) || a.id - b.id
  );
  const timed = (timing: ReturnType<typeof sprintTiming>) =>
    byStart.filter(s => sprintTiming(s, today) === timing);

  if (sprints.length === 0 && !onCreate) return null;

  const groups = [
    { label: "Current", timing: "current" as const, items: timed("current") },
    { label: "Upcoming", timing: "upcoming" as const, items: timed("upcoming") },
    { label: "Past", timing: "past" as const, items: timed("past").reverse() },
  ].filter(group => group.items.length > 0);

  return (
    <section className="rounded-2xl border border-(--obs-border) bg-(--obs-surface) px-5 py-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="m-0 font-mono text-[0.68rem] uppercase tracking-widest text-(--obs-text-faint)">
            View sprint
          </p>
          <p className="mb-0 mt-1 max-w-xl text-sm text-(--obs-text-muted)">
            Open an upcoming board to plan the next sprint while this one is still running.
          </p>
        </div>
        {onCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className="cursor-pointer border-0 bg-transparent font-mono text-[0.7rem] uppercase tracking-widest text-[#19B5CA]"
          >
            + New sprint
          </button>
        ) : null}
      </div>

      {sprints.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="obs-input-row min-h-11 min-w-0 max-w-xl flex-1 cursor-pointer">
            <select
              className="obs-select-field min-w-0 flex-1"
              value={selectedId ?? ""}
              onChange={e => {
                const id = Number(e.target.value);
                const sprint = sprints.find(s => s.id === id);
                if (sprint) onSelect(sprint);
              }}
              aria-label="View sprint"
            >
              {selectedId == null ? (
                <option value="" disabled>
                  Select a sprint
                </option>
              ) : null}
              {groups.map(group => (
                <optgroup key={group.label} label={group.label}>
                  {group.items.map(sprint => (
                    <option key={sprint.id} value={sprint.id}>
                      {optionLabel(sprint, group.timing)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          {onAllTimeChange ? (
            <button
              type="button"
              onClick={() => onAllTimeChange(!allTime)}
              className={twMerge(
                "shrink-0 cursor-pointer rounded-full border px-4 py-2 font-mono text-[0.65rem] uppercase tracking-widest",
                allTime ? "text-(--obs-text-primary)" : "bg-transparent text-(--obs-text-muted)"
              )}
              style={
                allTime
                  ? {
                      borderColor: "#19B5CA80",
                      background: "#19B5CA22",
                      color: "#19B5CA",
                    }
                  : { borderColor: "var(--obs-border)" }
              }
            >
              All time
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
