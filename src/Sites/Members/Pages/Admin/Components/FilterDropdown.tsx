import { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";

import { Input } from "src/Sites/Members/Components/Input";

import { FilterOperator } from "../Utils/types";
import { formatColumnLabel } from "../../../Utils/functions";
import { useAdminStore } from "../Hooks/useAdminStore";
import { TfiFilter } from "react-icons/tfi";

const FILTER_OPTIONS: Record<string, { value: FilterOperator; label: string }[]> = {
  text: [
    { value: null, label: "None" },
    { value: "eq", label: "Equals" },
    { value: "neq", label: "Not Equals" },
    { value: "like", label: "Like" },
    { value: "ilike", label: "ILike" },
    { value: "empty", label: "Empty" },
    { value: "non_empty", label: "Non-empty" },
  ],
  number: [
    { value: null, label: "None" },
    { value: "eq", label: "Equals" },
    { value: "neq", label: "Not Equals" },
    { value: "gt", label: "Greater" },
    { value: "gte", label: "Greater/equal" },
    { value: "lt", label: "Less" },
    { value: "lte", label: "Less/equal" },
    { value: "empty", label: "Empty" },
    { value: "non_empty", label: "Non-empty" },
  ],
  date: [
    { value: null, label: "None" },
    { value: "eq", label: "Equals" },
    { value: "neq", label: "Not Equals" },
    { value: "gt", label: "Greater" },
    { value: "gte", label: "Greater/equal" },
    { value: "lt", label: "Less" },
    { value: "lte", label: "Less/equal" },
    { value: "empty", label: "Empty" },
    { value: "non_empty", label: "Non-empty" },
  ],
  boolean: [
    { value: null, label: "None" },
    { value: "eq", label: "Equals" },
    { value: "neq", label: "Not Equals" },
    { value: "empty", label: "Empty" },
    { value: "non_empty", label: "Non-empty" },
  ],
};

const getFilterOptionsForType = (colType: string) => FILTER_OPTIONS[colType] ?? FILTER_OPTIONS.text;

const needsValue = (filter: FilterOperator) =>
  filter && filter !== "empty" && filter !== "non_empty";

export default function FilterDropdown() {
  const rootRef = useRef<HTMLDivElement>(null);
  const columnStates = useAdminStore(state => state.columnStates);
  const filterDropdownOpen = useAdminStore(state => state.filterDropdownOpen);
  const filterDraft = useAdminStore(state => state.filterDraft);
  const filterableColumns = useAdminStore(state => state.filterableColumns);
  const columns = useAdminStore(state => state.columns);

  const getColumnByKey = (key: string) => columns.find(c => String(c.key) === key);

  const appliedCount = Object.keys(columnStates).filter(
    k =>
      columnStates[k]?.filter &&
      (columnStates[k].filter === "empty" ||
        columnStates[k].filter === "non_empty" ||
        !!columnStates[k].filterValue)
  ).length;

  useEffect(() => {
    if (!filterDropdownOpen) return;

    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root || root.contains(e.target as Node)) return;
      useAdminStore.setState({ filterDropdownOpen: false });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") useAdminStore.setState({ filterDropdownOpen: false });
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [filterDropdownOpen]);

  const openPanel = () => {
    const { columnStates } = useAdminStore.getState();
    let nextDraft = Object.entries(columnStates)
      .filter(
        ([, s]) =>
          s?.filter && (s.filter === "empty" || s.filter === "non_empty" || !!s.filterValue)
      )
      .map(([columnKey, s]) => ({
        columnKey,
        filter: s.filter!,
        filterValue: s.filterValue || "",
      }));
    if (nextDraft.length === 0 && filterableColumns.length > 0) {
      const first = filterableColumns[0];
      const opts = getFilterOptionsForType(first.type);
      const defaultFilter = opts.find(o => o.value !== null)?.value ?? null;
      nextDraft = [
        {
          columnKey: String(first.key),
          filter: defaultFilter,
          filterValue: "",
        },
      ];
    }
    useAdminStore.setState({
      filterDraft: nextDraft,
      filterDropdownOpen: true,
      sortDropdownOpen: false,
    });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (filterDropdownOpen) {
            useAdminStore.setState({ filterDropdownOpen: false });
          } else {
            openPanel();
          }
        }}
        className="btn btn-outline hover:border-primary font-body fl-text-base/lg font-semibold"
        title="Filter"
        aria-expanded={filterDropdownOpen}
        aria-haspopup="dialog"
      >
        <TfiFilter /> {appliedCount > 0 && `(${appliedCount})`}
      </button>
      {filterDropdownOpen ? (
        <div
          role="dialog"
          aria-label="Table filters"
          className="absolute right-0 z-50 mt-2 min-w-[420px] rounded-box border border-(--obs-border) bg-base-200 p-4 font-body shadow-lg"
          // Keep panel open when native <select> steals focus (DaisyUI focus-within closes otherwise).
          onMouseDown={e => e.stopPropagation()}
        >
          <div className="space-y-2">
            {filterDraft.length > 0 ? (
              filterDraft.map((row, index) => {
                const col = getColumnByKey(row.columnKey);
                const options = col ? getFilterOptionsForType(col.type) : FILTER_OPTIONS.text;
                const showValue = needsValue(row.filter);

                return (
                  <div key={index} className="flex gap-2 items-center">
                    <select
                      className="select select-bordered min-w-32 font-body fl-text-sm/base font-normal"
                      value={row.columnKey}
                      onChange={e => {
                        const key = e.target.value;
                        const newCol = getColumnByKey(key);
                        const opts = newCol
                          ? getFilterOptionsForType(newCol.type)
                          : FILTER_OPTIONS.text;
                        const defaultFilter = opts.find(o => o.value !== null)?.value ?? null;
                        useAdminStore.setState(state => ({
                          filterDraft: state.filterDraft.map((r, i) =>
                            i === index
                              ? {
                                  columnKey: key,
                                  filter: defaultFilter,
                                  filterValue: "",
                                }
                              : r
                          ),
                        }));
                      }}
                    >
                      {filterableColumns.map(c => (
                        <option key={String(c.key)} value={String(c.key)}>
                          {c.label ?? formatColumnLabel(c.key)}
                        </option>
                      ))}
                    </select>
                    <select
                      className="select select-bordered min-w-[100px] font-body fl-text-sm/base font-normal"
                      value={row.filter ?? ""}
                      onChange={e => {
                        const val = (e.target.value || null) as FilterOperator;
                        useAdminStore.setState(state => ({
                          filterDraft: state.filterDraft.map((r, i) =>
                            i === index
                              ? {
                                  ...r,
                                  filter: val,
                                  filterValue: needsValue(val) ? r.filterValue : "",
                                }
                              : r
                          ),
                        }));
                      }}
                    >
                      {options.map(opt => (
                        <option key={opt.value ?? "none"} value={opt.value ?? ""}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {showValue && (
                      <Input
                        label="Filter value"
                        fieldId={`admin-filter-value-${index}`}
                        hideLabel
                        type={
                          col?.type === "number"
                            ? "number"
                            : col?.type === "date"
                              ? "datetime-local"
                              : "text"
                        }
                        value={row.filterValue}
                        setValue={v =>
                          useAdminStore.setState(state => ({
                            filterDraft: state.filterDraft.map((r, i) =>
                              i === index ? { ...r, filterValue: v } : r
                            ),
                          }))
                        }
                        placeholder="Value"
                        className="min-w-[100px] max-w-[200px]"
                      />
                    )}
                    <button
                      type="button"
                      className="btn btn-ghost btn-square p-0 min-h-0 h-8 w-8 shrink-0"
                      onClick={() => {
                        useAdminStore.setState(state => ({
                          filterDraft: state.filterDraft.filter((_, i) => i !== index),
                        }));
                      }}
                      aria-label="Remove filter"
                    >
                      <IoClose className="text-lg" />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-(--obs-text-muted)">No filters applied</p>
            )}
          </div>
          <div className="mt-4 flex gap-2 border-t border-(--obs-border) pt-2">
            <button
              type="button"
              className="btn btn-outline hover:border-primary flex-1"
              onClick={() => {
                const { filterDraft, filterableColumns } = useAdminStore.getState();
                const usedKeys = new Set(filterDraft.map(r => r.columnKey).filter(Boolean));
                const firstUnused = filterableColumns.find(c => !usedKeys.has(String(c.key)));
                if (firstUnused) {
                  const opts = getFilterOptionsForType(firstUnused.type);
                  const defaultFilter = opts.find(o => o.value !== null)?.value ?? null;
                  useAdminStore.setState({
                    filterDraft: [
                      ...filterDraft,
                      {
                        columnKey: String(firstUnused.key),
                        filter: defaultFilter,
                        filterValue: "",
                      },
                    ],
                  });
                }
              }}
              disabled={
                filterableColumns.length === 0 ||
                (filterDraft.length > 0 &&
                  filterableColumns.every(c =>
                    filterDraft.some(r => r.columnKey === String(c.key))
                  ))
              }
            >
              Add column
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={() => {
                const { filterDraft } = useAdminStore.getState();
                const nextStates: Record<
                  string,
                  { sort: null; filter: FilterOperator; filterValue: string }
                > = {};
                filterDraft.forEach(row => {
                  if (row.columnKey && row.filter) {
                    nextStates[row.columnKey] = {
                      sort: null,
                      filter: row.filter,
                      filterValue: row.filterValue || "",
                    };
                  }
                });
                useAdminStore.setState({
                  columnStates: nextStates,
                  filterDropdownOpen: false,
                });
              }}
            >
              Apply filters
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
