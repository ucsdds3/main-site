import { useMemo, useState } from "react";

import { twMerge } from "src/Utils/cn";

import type { BoardAssigneeOption } from "../types";

type AssigneeMultiSelectProps = {
  options: BoardAssigneeOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  label?: string;
};

export default function AssigneeMultiSelect({
  options,
  selectedIds,
  onChange,
  disabled,
  label = "Task assignee",
}: AssigneeMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => options.filter(o => selectedIds.includes(o.id)),
    [options, selectedIds]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      o => o.full_name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q)
    );
  }, [options, query]);

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter(x => x !== id));
    else onChange([...selectedIds, id]);
  };

  return (
    <div className="relative flex w-full min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-(--obs-text-muted)">
        {label} <span className="text-red-500">*</span>
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className={twMerge(
          "obs-input-row min-h-11 w-full cursor-pointer justify-between text-left",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <span className="truncate text-sm text-(--obs-text-primary)">
          {selected.length === 0
            ? "Select one or more people"
            : selected.map(s => s.full_name).join(", ")}
        </span>
        <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-widest text-(--obs-text-faint)">
          {selected.length}
        </span>
      </button>

      {open && !disabled ? (
        <div className="absolute top-full z-30 mt-1 flex max-h-72 w-full flex-col overflow-hidden rounded-xl border border-(--obs-border) bg-[#080e19] shadow-xl">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search board…"
            className="border-0 border-b border-(--obs-border) bg-transparent px-3 py-2 text-sm text-(--obs-text-primary) outline-none"
          />
          <ul className="min-h-0 flex-1 overflow-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-(--obs-text-muted)">No matches</li>
            ) : (
              filtered.map(option => {
                const checked = selectedIds.includes(option.id);
                return (
                  <li key={option.id}>
                    <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-(--obs-text-primary) hover:bg-(--obs-surface-hover)">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(option.id)}
                        className="accent-[#19B5CA]"
                      />
                      <span className="min-w-0 truncate">{option.full_name}</span>
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
