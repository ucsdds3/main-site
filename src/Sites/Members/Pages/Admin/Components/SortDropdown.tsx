import { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

import { formatColumnLabel } from "../../../Utils/functions";
import { useAdminStore } from "../Hooks/useAdminStore";
import { TfiArrowsVertical } from "react-icons/tfi";

export default function SortDropdown() {
  const rootRef = useRef<HTMLDivElement>(null);
  const sortOrder = useAdminStore(state => state.sortOrder);
  const sortDropdownOpen = useAdminStore(state => state.sortDropdownOpen);
  const sortDraft = useAdminStore(state => state.sortDraft);
  const sortableColumns = useAdminStore(state => state.sortableColumns);

  useEffect(() => {
    if (!sortDropdownOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root || root.contains(e.target as Node)) return;
      useAdminStore.setState({ sortDropdownOpen: false });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") useAdminStore.setState({ sortDropdownOpen: false });
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sortDropdownOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (sortDropdownOpen) {
            useAdminStore.setState({ sortDropdownOpen: false });
          } else {
            const { sortOrder } = useAdminStore.getState();
            useAdminStore.setState({
              sortDraft: [...sortOrder],
              sortDropdownOpen: true,
              filterDropdownOpen: false,
            });
          }
        }}
        className="btn btn-outline hover:border-primary font-body fl-text-base/lg font-semibold"
        title="Sort"
        aria-expanded={sortDropdownOpen}
        aria-haspopup="dialog"
      >
        <TfiArrowsVertical /> {sortOrder.length > 0 && `(${sortOrder.length})`}
      </button>
      {sortDropdownOpen ? (
        <div
          role="dialog"
          aria-label="Table sorts"
          className="absolute left-1/2 z-50 mt-2 w-80 -translate-x-1/2 rounded-box border border-(--obs-border) bg-base-200 p-4 font-body shadow-lg"
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="space-y-2">
            {sortDraft.length > 0 ? (
              sortDraft.map((row, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <select
                    className="select select-bordered flex-1 font-body fl-text-sm/base font-normal"
                    value={row.columnKey}
                    onChange={e =>
                      useAdminStore.setState(state => ({
                        sortDraft: state.sortDraft.map((r, i) =>
                          i === index ? { ...r, columnKey: e.target.value } : r
                        ),
                      }))
                    }
                  >
                    {sortableColumns.map(col => (
                      <option key={String(col.key)} value={String(col.key)}>
                        {col.label ?? formatColumnLabel(col.key)}
                      </option>
                    ))}
                  </select>
                  <select
                    className="select select-bordered w-24 font-body fl-text-sm/base font-normal"
                    value={row.direction}
                    onChange={e =>
                      useAdminStore.setState(state => ({
                        sortDraft: state.sortDraft.map((r, i) =>
                          i === index ? { ...r, direction: e.target.value as "asc" | "desc" } : r
                        ),
                      }))
                    }
                  >
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-ghost btn-square p-0 min-h-0 h-8 w-8"
                    onClick={() => {
                      useAdminStore.setState(state => ({
                        sortDraft: state.sortDraft.filter((_, i) => i !== index),
                      }));
                    }}
                    aria-label="Remove sort"
                  >
                    <IoClose className="text-lg" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-(--obs-text-muted)">No sorts applied</p>
            )}
          </div>
          <div className="mt-4 flex gap-2 border-t border-(--obs-border) pt-2">
            <button
              type="button"
              className="btn btn-outline hover:border-primary flex-1"
              onClick={() => {
                const { sortDraft, sortableColumns } = useAdminStore.getState();
                const usedKeys = new Set(sortDraft.map(r => r.columnKey));
                const firstUnused = sortableColumns.find(c => !usedKeys.has(String(c.key)));
                if (firstUnused) {
                  useAdminStore.setState({
                    sortDraft: [
                      ...sortDraft,
                      { columnKey: String(firstUnused.key), direction: "asc" as const },
                    ],
                  });
                }
              }}
              disabled={
                sortableColumns.length === 0 ||
                (sortDraft.length > 0 &&
                  sortableColumns.every(c => sortDraft.some(r => r.columnKey === String(c.key))))
              }
            >
              Add column
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={() => {
                const { sortDraft } = useAdminStore.getState();
                useAdminStore.setState({
                  sortOrder: sortDraft.filter(row => row.columnKey),
                  sortDropdownOpen: false,
                });
              }}
            >
              Apply sorts
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
