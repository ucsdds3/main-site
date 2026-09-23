import { useMemo, useState } from "react";

import { twMerge } from "src/Utils/cn";

import { SPRINT_STATUS_LABELS } from "../constants";
import type { SprintRow } from "../types";

type SprintMultiSelectProps = {
  sprints: SprintRow[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
};

export default function SprintMultiSelect({
  sprints,
  selectedIds,
  onChange,
}: SprintMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => sprints.filter(s => selectedIds.includes(s.id)),
    [sprints, selectedIds]
  );

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) return;
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="relative flex w-full min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-(--obs-text-muted)">
        Sprints <span className="text-red-500">*</span>
      </span>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="obs-input-row min-h-11 w-full cursor-pointer justify-between text-left"
      >
        <span className="truncate text-sm text-(--obs-text-primary)">
          {selected.length === 0
            ? "Select one or more sprints"
            : selected.map(s => s.name).join(", ")}
        </span>
        <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-widest text-(--obs-text-faint)">
          {selected.length}
        </span>
      </button>
      <p className="m-0 text-xs text-(--obs-text-faint)">
        Check every sprint this work belongs to. Uncheck the current sprint and check the next one
        to roll leftover work without duplicating the card.
      </p>

      {open ? (
        <div className="absolute top-full z-30 mt-1 flex max-h-72 w-full flex-col overflow-hidden rounded-xl border border-(--obs-border) bg-[#080e19] shadow-xl">
          <ul className="min-h-0 flex-1 overflow-auto py-1">
            {sprints.length === 0 ? (
              <li className="px-3 py-2 text-sm text-(--obs-text-muted)">No sprints</li>
            ) : (
              sprints.map(sprint => {
                const checked = selectedIds.includes(sprint.id);
                return (
                  <li key={sprint.id}>
                    <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-(--obs-text-primary) hover:bg-(--obs-surface-hover)">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(sprint.id)}
                        className="accent-[#19B5CA]"
                      />
                      <span className="min-w-0 flex-1 truncate">{sprint.name}</span>
                      <span
                        className={twMerge(
                          "font-mono text-[0.58rem] uppercase tracking-widest text-(--obs-text-faint)"
                        )}
                      >
                        {SPRINT_STATUS_LABELS[sprint.status]}
                      </span>
                    </label>
                  </li>
                );
              })
            )}
          </ul>
          <button
            type="button"
            className="border-0 border-t border-(--obs-border) bg-transparent py-2 font-mono text-[0.65rem] uppercase tracking-widest text-(--obs-text-muted)"
            onClick={() => setOpen(false)}
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
}
