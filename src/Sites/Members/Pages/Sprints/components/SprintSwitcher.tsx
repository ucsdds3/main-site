import { twMerge } from "src/Utils/cn";

import { formatSprintDates, SPRINT_STATUS_LABELS } from "../constants";
import type { SprintRow } from "../types";

type SprintSwitcherProps = {
  sprints: SprintRow[];
  selectedId: number | null;
  onSelect: (sprint: SprintRow) => void;
  onCreate?: () => void;
  allTime?: boolean;
  onAllTimeChange?: (allTime: boolean) => void;
};

function optionLabel(sprint: SprintRow) {
  return `${sprint.name} · ${formatSprintDates(sprint.starts_on, sprint.ends_on)}`;
}

export default function SprintSwitcher({
  sprints,
  selectedId,
  onSelect,
  onCreate,
  allTime,
  onAllTimeChange,
}: SprintSwitcherProps) {
  const active = sprints.filter(s => s.status === "active");
  const upcoming = sprints
    .filter(s => s.status === "planning")
    .sort((a, b) => a.starts_on.localeCompare(b.starts_on) || a.id - b.id);
  const past = sprints
    .filter(s => s.status === "closed")
    .sort((a, b) => b.starts_on.localeCompare(a.starts_on) || b.id - a.id);

  if (sprints.length === 0 && !onCreate) return null;

  const groups: { label: string; items: SprintRow[] }[] = [
    { label: SPRINT_STATUS_LABELS.active, items: active },
    { label: "Upcoming", items: upcoming },
    { label: "Past", items: past },
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
                      {optionLabel(sprint)}
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
