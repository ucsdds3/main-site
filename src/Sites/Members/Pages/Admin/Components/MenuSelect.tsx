import { useId, useState } from "react";

export type MenuSelectOption = { value: string; label: string };

type MenuSelectProps = {
  value: string;
  options: MenuSelectOption[];
  onChange: (value: string) => void;
  className?: string;
  "aria-label"?: string;
};

/**
 * In-panel listbox (no document outside-click listeners, no native <select>).
 * Nested popovers + document pointerdown handlers were closing the parent filter panel.
 */
export default function MenuSelect({
  value,
  options,
  onChange,
  className = "",
  "aria-label": ariaLabel,
}: MenuSelectProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  const label = selected?.label ?? value;

  return (
    <div className={`min-w-0 ${className}`}>
      <button
        type="button"
        className="btn btn-outline btn-sm h-10 min-h-10 w-full justify-between gap-2 px-3 font-body fl-text-sm/base font-normal normal-case"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onMouseDown={e => {
          // Keep focus from leaving the filter panel / triggering parent dismiss logic.
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={e => {
          e.stopPropagation();
          setOpen(v => !v);
        }}
      >
        <span className="truncate">{label || "Select…"}</span>
        <span className="opacity-60" aria-hidden>
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="mt-1 max-h-48 overflow-y-auto rounded-box border border-(--obs-border) bg-base-100 py-1"
          onMouseDown={e => e.stopPropagation()}
        >
          {options.map(opt => {
            const isSelected = opt.value === value;
            return (
              <li key={opt.value === "" ? "__empty" : opt.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`flex w-full px-3 py-2 text-left font-body fl-text-sm/base hover:bg-base-200 ${
                    isSelected ? "bg-base-200 font-semibold" : ""
                  }`}
                  onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
