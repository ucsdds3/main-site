import { useEffect } from "react";
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

function buildInitialFilterDraft(
  columnStates: ReturnType<typeof useAdminStore.getState>["columnStates"],
  filterableColumns: ReturnType<typeof useAdminStore.getState>["filterableColumns"]
) {
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
  return nextDraft;
}

/** Toolbar toggle only — panel is rendered separately in document flow. */
export function FilterToggleButton() {
  const columnStates = useAdminStore(state => state.columnStates);
  const filterDropdownOpen = useAdminStore(state => state.filterDropdownOpen);
  const filterableColumns = useAdminStore(state => state.filterableColumns);

  const appliedCount = Object.keys(columnStates).filter(
    k =>
      columnStates[k]?.filter &&
      (columnStates[k].filter === "empty" ||
        columnStates[k].filter === "non_empty" ||
        !!columnStates[k].filterValue)
  ).length;

  return (
    <button
      type="button"
      onClick={() => {
        if (filterDropdownOpen) {
          useAdminStore.setState({ filterDropdownOpen: false });
          return;
        }
        useAdminStore.setState({
          filterDraft: buildInitialFilterDraft(columnStates, filterableColumns),
          filterDropdownOpen: true,
          sortDropdownOpen: false,
        });
      }}
      className={`btn btn-outline hover:border-primary font-body fl-text-base/lg font-semibold ${
        filterDropdownOpen ? "btn-active border-primary" : ""
      }`}
      title="Filter"
      aria-expanded={filterDropdownOpen}
      aria-controls="admin-filter-panel"
    >
      <TfiFilter /> {appliedCount > 0 && `(${appliedCount})`}
    </button>
  );
}

/** Inline filter editor below the toolbar (not an absolute popup under the icon). */
export function FilterPanel() {
  const filterDropdownOpen = useAdminStore(state => state.filterDropdownOpen);
  const filterDraft = useAdminStore(state => state.filterDraft);
  const filterableColumns = useAdminStore(state => state.filterableColumns);
  const columns = useAdminStore(state => state.columns);

  const getColumnByKey = (key: string) => columns.find(c => String(c.key) === key);

  useEffect(() => {
    if (!filterDropdownOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") useAdminStore.setState({ filterDropdownOpen: false });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [filterDropdownOpen]);

  if (!filterDropdownOpen) return null;

  return (
    <div
      id="admin-filter-panel"
      role="region"
      aria-label="Table filters"
      className="mb-4 w-full rounded-box border border-(--obs-border) bg-base-200 p-4 font-body shadow-sm"
    >
      <div className="space-y-3">
        {filterDraft.length > 0 ? (
          filterDraft.map((row, index) => {
            const col = getColumnByKey(row.columnKey);
            const options = col ? getFilterOptionsForType(col.type) : FILTER_OPTIONS.text;
            const showValue = needsValue(row.filter);

            return (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-lg border border-(--obs-border) bg-base-100 p-3 sm:flex-row sm:items-end"
              >
                <label className="flex min-w-0 flex-1 flex-col gap-1 font-body fl-text-sm/base">
                  <span className="text-(--obs-text-muted)">Column</span>
                  <select
                    className="select select-bordered w-full font-body fl-text-sm/base font-normal"
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
                </label>

                <label className="flex min-w-0 flex-1 flex-col gap-1 font-body fl-text-sm/base">
                  <span className="text-(--obs-text-muted)">Operator</span>
                  <select
                    className="select select-bordered w-full font-body fl-text-sm/base font-normal"
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
                </label>

                {showValue ? (
                  <div className="min-w-0 flex-[1.2]">
                    <span className="mb-1 block font-body fl-text-sm/base text-(--obs-text-muted)">
                      Value
                    </span>
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
                      className="min-w-0 w-full!"
                    />
                  </div>
                ) : null}

                <button
                  type="button"
                  className="btn btn-ghost btn-square shrink-0 self-end"
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

      <div className="mt-4 flex flex-wrap gap-2 border-t border-(--obs-border) pt-3">
        <button
          type="button"
          className="btn btn-outline hover:border-primary"
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
              filterableColumns.every(c => filterDraft.some(r => r.columnKey === String(c.key))))
          }
        >
          Add column
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => useAdminStore.setState({ filterDropdownOpen: false })}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary ml-auto"
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
  );
}

/** @deprecated use FilterToggleButton + FilterPanel */
export default function FilterDropdown() {
  return <FilterToggleButton />;
}
