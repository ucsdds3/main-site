import { useEffect } from "react";
import { IoClose } from "react-icons/io5";

import { formatColumnLabel } from "../../../Utils/functions";
import { useAdminStore } from "../Hooks/useAdminStore";
import { TfiArrowsVertical } from "react-icons/tfi";

import MenuSelect from "./MenuSelect";

export default function SortDropdown() {
  const sortOrder = useAdminStore(state => state.sortOrder);
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

  return (
    <div className="relative">
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
          onClick={e => e.stopPropagation()}
        >
          <div className="space-y-3">
            {sortDraft.length > 0 ? (
              sortDraft.map((row, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-lg border border-(--obs-border) p-2"
                >
                  <div className="flex gap-2 items-start">
                    <MenuSelect
                      className="min-w-0 flex-1"
                      aria-label="Sort column"
                      value={row.columnKey}
                      options={sortableColumns.map(col => ({
                        value: String(col.key),
                        label: col.label ?? formatColumnLabel(col.key),
                      }))}
                      onChange={columnKey =>
                        useAdminStore.setState(state => ({
                          sortDraft: state.sortDraft.map((r, i) =>
                            i === index ? { ...r, columnKey } : r
                          ),
                        }))
                      }
                    />
                    <MenuSelect
                      className="w-24 shrink-0"
                      aria-label="Sort direction"
                      value={row.direction}
                      options={[
                        { value: "asc", label: "Asc" },
                        { value: "desc", label: "Desc" },
                      ]}
                      onChange={direction =>
                        useAdminStore.setState(state => ({
                          sortDraft: state.sortDraft.map((r, i) =>
                            i === index ? { ...r, direction: direction as "asc" | "desc" } : r
                          ),
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-square p-0 min-h-0 h-10 w-8 shrink-0"
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
