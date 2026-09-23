import { useEffect, useMemo, useRef, useState } from "react";

import { twMerge } from "src/Utils/cn";

import type { BoardAssigneeOption } from "../types";

type PersonTypeaheadProps = {
  label: string;
  hint?: string;
  required?: boolean;
  options: BoardAssigneeOption[];
  valueId: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
  noneLabel?: string;
  disabled?: boolean;
};

export default function PersonTypeahead({
  label,
  hint,
  required,
  options,
  valueId,
  onChange,
  placeholder = "Search by name…",
  noneLabel,
  disabled,
}: PersonTypeaheadProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = options.find(o => o.id === valueId) ?? null;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      o => o.full_name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q)
    );
  }, [options, query]);

  const displayValue = open || query ? query : (selected?.full_name ?? "");

  return (
    <div ref={rootRef} className="relative flex w-full min-w-0 flex-col gap-2">
      <span className="text-sm font-medium text-(--obs-text-muted)">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
        {hint ? <span className="ml-1 font-normal text-(--obs-text-faint)">{hint}</span> : null}
      </span>
      <input
        type="search"
        disabled={disabled}
        value={displayValue}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={e => {
          setQuery(e.target.value);
          setOpen(true);
          if (e.target.value.trim() === "" && noneLabel) onChange(null);
        }}
        className="obs-input-row min-h-11 w-full text-sm text-(--obs-text-primary) outline-none"
      />
      {open && !disabled ? (
        <ul className="absolute top-full z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-(--obs-border) bg-[#080e19] py-1 shadow-xl">
          {noneLabel ? (
            <li>
              <button
                type="button"
                className={twMerge(
                  "w-full cursor-pointer border-0 bg-transparent px-3 py-2 text-left text-sm hover:bg-(--obs-surface-hover)",
                  valueId == null ? "text-[#19B5CA]" : "text-(--obs-text-primary)"
                )}
                onMouseDown={e => e.preventDefault()}
                onClick={() => {
                  onChange(null);
                  setQuery("");
                  setOpen(false);
                }}
              >
                {noneLabel}
              </button>
            </li>
          ) : null}
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-(--obs-text-muted)">No matches</li>
          ) : (
            filtered.map(option => (
              <li key={option.id}>
                <button
                  type="button"
                  className={twMerge(
                    "flex w-full cursor-pointer flex-col border-0 bg-transparent px-3 py-2 text-left hover:bg-(--obs-surface-hover)",
                    option.id === valueId ? "text-[#19B5CA]" : "text-(--obs-text-primary)"
                  )}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => {
                    onChange(option.id);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <span className="truncate text-sm">{option.full_name}</span>
                  <span className="truncate font-mono text-[0.65rem] text-(--obs-text-faint)">
                    {option.email}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
