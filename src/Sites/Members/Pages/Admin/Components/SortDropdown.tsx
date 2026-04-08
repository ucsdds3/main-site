import { IoClose } from "react-icons/io5";

import { formatColumnLabel } from "../../../Utils/functions";
import { useAdminStore } from "../Hooks/useAdminStore";
import { TfiArrowsVertical } from "react-icons/tfi";

export default function SortDropdown() {
  const sortOrder = useAdminStore(state => state.sortOrder);
  const sortDropdownOpen = useAdminStore(state => state.sortDropdownOpen);
  const sortDraft = useAdminStore(state => state.sortDraft);
  const sortableColumns = useAdminStore(state => state.sortableColumns);

  return (
    <div className={`dropdown dropdown-center ${sortDropdownOpen ? "dropdown-open" : ""}`}>
      <button
        tabIndex={0}
        onClick={() => {
          if (sortDropdownOpen) {
            useAdminStore.setState({ sortDropdownOpen: false });
          } else {
            const { sortOrder } = useAdminStore.getState();
            useAdminStore.setState({ sortDraft: [...sortOrder], sortDropdownOpen: true });
          }
        }}
        className="btn btn-outline hover:border-primary font-body fl-text-base/lg font-semibold"
        title="Sort"
      >
        <TfiArrowsVertical /> {sortOrder.length > 0 && `(${sortOrder.length})`}
      </button>
      <div
        tabIndex={0}
        className="dropdown-content menu bg-base-200 rounded-box z-1 mt-2 w-80 p-4 font-body shadow-lg"
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
                  onMouseDown={e => e.preventDefault()}
                  onClick={e => {
                    e.stopPropagation();
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
    </div>
  );
}
