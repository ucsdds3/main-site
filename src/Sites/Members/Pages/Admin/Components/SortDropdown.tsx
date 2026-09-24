import { useEffect } from "react";
import { IoClose } from "react-icons/io5";

import { formatColumnLabel } from "../../../Utils/functions";
import { useAdminStore } from "../Hooks/useAdminStore";
import { TfiArrowsVertical } from "react-icons/tfi";

/** Toolbar toggle only — panel is rendered separately in document flow. */
export function SortToggleButton() {
  const sortOrder = useAdminStore(state => state.sortOrder);
  const sortDropdownOpen = useAdminStore(state => state.sortDropdownOpen);

  return (
    <button
      type="button"
      onClick={() => {
        if (sortDropdownOpen) {
          useAdminStore.setState({ sortDropdownOpen: false });
          return;
        }
        const { sortOrder } = useAdminStore.getState();
        useAdminStore.setState({
          sortDraft: [...sortOrder],
          sortDropdownOpen: true,
          filterDropdownOpen: false,
        });
      }}
      className={`btn btn-outline hover:border-primary font-body fl-text-base/lg font-semibold ${
        sortDropdownOpen ? "btn-active border-primary" : ""
      }`}
      title="Sort"
      aria-expanded={sortDropdownOpen}
      aria-controls="admin-sort-panel"
    >
      <TfiArrowsVertical /> {sortOrder.length > 0 && `(${sortOrder.length})`}
    </button>
  );
}

/** Inline sort editor below the toolbar (not an absolute popup under the icon). */
export function SortPanel() {
  const sortDropdownOpen = useAdminStore(state => state.sortDropdownOpen);
  const sortDraft = useAdminStore(state => state.sortDraft);
  const sortableColumns = useAdminStore(state => state.sortableColumns);

  useEffect(() => {
    if (!sortDropdownOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") useAdminStore.setState({ sortDropdownOpen: false });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sortDropdownOpen]);

  if (!sortDropdownOpen) return null;

  return (
    <div
      id="admin-sort-panel"
      role="region"
      aria-label="Table sorts"
      className="mb-4 w-full rounded-box border border-(--obs-border) bg-base-200 p-4 font-body shadow-sm"
    >
      <div className="space-y-3">
        {sortDraft.length > 0 ? (
          sortDraft.map((row, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-lg border border-(--obs-border) bg-base-100 p-3 sm:flex-row sm:items-end"
            >
              <label className="flex min-w-0 flex-1 flex-col gap-1 font-body fl-text-sm/base">
                <span className="text-(--obs-text-muted)">Column</span>
                <select
                  className="select select-bordered w-full font-body fl-text-sm/base font-normal"
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
              </label>
              <label className="flex w-full flex-col gap-1 font-body fl-text-sm/base sm:w-28">
                <span className="text-(--obs-text-muted)">Direction</span>
                <select
                  className="select select-bordered w-full font-body fl-text-sm/base font-normal"
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
              </label>
              <button
                type="button"
                className="btn btn-ghost btn-square shrink-0 self-end"
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
      <div className="mt-4 flex flex-wrap gap-2 border-t border-(--obs-border) pt-3">
        <button
          type="button"
          className="btn btn-outline hover:border-primary"
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
          className="btn btn-ghost"
          onClick={() => useAdminStore.setState({ sortDropdownOpen: false })}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary ml-auto"
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
  );
}

/** @deprecated use SortToggleButton + SortPanel */
export default function SortDropdown() {
  return <SortToggleButton />;
}
