import { IoClose } from "react-icons/io5";

import { formatColumnLabel } from "../../../Utils/functions";
import { useSortStore, useSortableColumns } from "../Hooks/useSortStore";

export default function SortDropdown() {
  const sortOrder = useSortStore(state => state.sortOrder);
  const sortDropdownOpen = useSortStore(state => state.sortDropdownOpen);
  const sortDraft = useSortStore(state => state.sortDraft);
  const sortableColumns = useSortableColumns();
  const openSortDropdown = useSortStore(state => state.openSortDropdown);
  const applySorts = useSortStore(state => state.applySorts);
  const addSortRow = useSortStore(state => state.addSortRow);
  const updateSortRow = useSortStore(state => state.updateSortRow);
  const removeSortRow = useSortStore(state => state.removeSortRow);
  const setSortDropdownOpen = useSortStore(state => state.setSortDropdownOpen);

  return (
    <div className={`dropdown ${sortDropdownOpen ? "dropdown-open" : ""}`}>
      <button
        tabIndex={0}
        onClick={() => (sortDropdownOpen ? setSortDropdownOpen(false) : openSortDropdown())}
        className="btn btn-outline text-lg font-bold"
        title="Sort"
      >
        Sort {sortOrder.length > 0 && `(${sortOrder.length})`}
      </button>
      <div
        tabIndex={0}
        className="dropdown-content menu bg-base-200 rounded-box z-1 p-4 shadow-lg w-80 mt-2"
      >
        <div className="space-y-2">
          {sortDraft.length > 0 ? sortDraft.map((row, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                className="select select-bordered flex-1"
                value={row.columnKey}
                onChange={e => updateSortRow(index, e.target.value)}
              >
                {sortableColumns.map(col => (
                  <option key={String(col.key)} value={String(col.key)}>
                    {col.label ?? formatColumnLabel(col.key)}
                  </option>
                ))}
              </select>
              <select
                className="select select-bordered w-24"
                value={row.direction}
                onChange={e => updateSortRow(index, undefined, e.target.value as "asc" | "desc")}
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
              <button
                type="button"
                className="btn btn-ghost btn-square p-0 min-h-0 h-8 w-8"
                onMouseDown={e => e.preventDefault()}
                onClick={e => {
                  e.stopPropagation();
                  removeSortRow(index);
                }}
                aria-label="Remove sort"
              >
                <IoClose className="text-lg" />
              </button>
            </div>
          )) : (
            <p className="text-center text-base-content/60">No sorts applied</p>
          )}
        </div>
        <div className="flex gap-2 mt-4 pt-2 border-t border-base-content/20">
          <button
            type="button"
            className="btn btn-outline hover:border-primary flex-1"
            onClick={addSortRow}
            disabled={
              sortableColumns.length === 0 ||
              (sortDraft.length > 0 &&
                sortableColumns.every(c => sortDraft.some(r => r.columnKey === String(c.key))))
            }
          >
            Add column
          </button>
          <button type="button" className="btn btn-primary flex-1" onClick={applySorts}>
            Apply sorts
          </button>
        </div>
      </div>
    </div>
  );
}
