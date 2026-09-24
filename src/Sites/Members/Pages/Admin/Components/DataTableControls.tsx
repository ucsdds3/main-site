import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { TfiReload, TfiDownload, TfiPlus, TfiEmail, TfiFilter, TfiArrowsVertical } from "react-icons/tfi";

import { useAdminStore } from "../Hooks/useAdminStore";
import {
  downloadAdminTableCsv,
  filterAdminTableRows,
} from "../Utils/dataTableHelpers";
import { downloadNewsletterEmailsCsv } from "../Utils/newsletterExport";
import { formatColumnLabel } from "../../../Utils/functions";
import { Input } from "src/Sites/Members/Components/Input";
import Select from "src/Sites/Members/Components/Select";
import { FilterOperator } from "../Utils/types";

const FILTER_OPTIONS: Record<string, { value: FilterOperator; label: string }[]> = {
  text: [
    { value: "eq", label: "Equals" },
    { value: "neq", label: "Not Equals" },
    { value: "like", label: "Like" },
    { value: "ilike", label: "ILike" },
    { value: "empty", label: "Empty" },
    { value: "non_empty", label: "Non-empty" },
  ],
  number: [
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
    { value: "eq", label: "Equals" },
    { value: "neq", label: "Not Equals" },
    { value: "empty", label: "Empty" },
    { value: "non_empty", label: "Non-empty" },
  ],
};

const getFilterOptionsForType = (colType: string) => FILTER_OPTIONS[colType] ?? FILTER_OPTIONS.text;

const needsValue = (filter: FilterOperator) =>
  Boolean(filter && filter !== "empty" && filter !== "non_empty");

type FilterRow = {
  columnKey: string;
  filter: FilterOperator;
  filterValue: string;
};

type SortRow = { columnKey: string; direction: "asc" | "desc" };

/** Button-based picker — avoids native <select> (broken under SimpleBar + DaisyUI .select). */
function OptionPicker({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="min-w-0 flex-1">
      <legend className="mb-1 font-body fl-text-sm/base text-(--obs-text-muted)">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value === "" ? "__empty" : opt.value}
              type="button"
              className={`btn btn-sm normal-case font-body fl-text-sm/base ${
                selected ? "btn-primary" : "btn-outline"
              }`}
              aria-pressed={selected}
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function DataTableControls() {
  const tableName = useAdminStore(state => state.tableName);
  const columns = useAdminStore(state => state.columns);
  const data = useAdminStore(state => state.data);
  const loading = useAdminStore(state => state.loading);
  const reload = useAdminStore(state => state.reload);
  const search = useAdminStore(state => state.dataTableSearch);
  const setSearch = useAdminStore(state => state.setDataTableSearch);
  const showUpcomingEventsOnly = useAdminStore(state => state.showUpcomingEventsOnly);
  const setShowUpcomingEventsOnly = useAdminStore(state => state.setShowUpcomingEventsOnly);
  const bridge = useAdminStore(state => state.dataTableUiBridge);
  const filterableColumns = useAdminStore(state => state.filterableColumns);
  const sortableColumns = useAdminStore(state => state.sortableColumns);
  const columnStates = useAdminStore(state => state.columnStates);
  const sortOrder = useAdminStore(state => state.sortOrder);

  // Local UI state only — never closed by document listeners / native select quirks.
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<FilterRow[]>([]);
  const [sortDraft, setSortDraft] = useState<SortRow[]>([]);

  const filteredData = useMemo(
    () =>
      filterAdminTableRows(tableName, columns, data as Record<string, any>[], search, {
        showUpcomingEventsOnly,
      }),
    [columns, data, search, showUpcomingEventsOnly, tableName]
  );

  const appliedFilterCount = Object.keys(columnStates).filter(
    k =>
      columnStates[k]?.filter &&
      (columnStates[k].filter === "empty" ||
        columnStates[k].filter === "non_empty" ||
        !!columnStates[k].filterValue)
  ).length;

  const openFilter = () => {
    const fromApplied: FilterRow[] = Object.entries(columnStates)
      .filter(
        ([, s]) =>
          s?.filter && (s.filter === "empty" || s.filter === "non_empty" || !!s.filterValue)
      )
      .map(([columnKey, s]) => ({
        columnKey,
        filter: s.filter!,
        filterValue: s.filterValue || "",
      }));
    if (fromApplied.length === 0 && filterableColumns.length > 0) {
      const first = filterableColumns[0];
      const opts = getFilterOptionsForType(first.type);
      fromApplied.push({
        columnKey: String(first.key),
        filter: opts[0]?.value ?? "eq",
        filterValue: "",
      });
    }
    setFilterDraft(fromApplied);
    setSortOpen(false);
    setFilterOpen(true);
  };

  const openSort = () => {
    setSortDraft(sortOrder.length > 0 ? [...sortOrder] : []);
    setFilterOpen(false);
    setSortOpen(true);
  };

  const applyFilters = () => {
    const next: Record<string, { sort: null; filter: FilterOperator; filterValue: string }> = {};
    filterDraft.forEach(row => {
      if (row.columnKey && row.filter) {
        next[row.columnKey] = {
          sort: null,
          filter: row.filter,
          filterValue: row.filterValue || "",
        };
      }
    });
    useAdminStore.setState({ columnStates: next });
    setFilterOpen(false);
  };

  const applySorts = () => {
    useAdminStore.setState({
      sortOrder: sortDraft.filter(row => row.columnKey),
    });
    setSortOpen(false);
  };

  const handleDownload = () => {
    downloadAdminTableCsv(tableName, columns, filteredData);
  };

  const handleNewsletterExport = () => {
    const { count } = downloadNewsletterEmailsCsv(data as Record<string, unknown>[]);
    if (count === 0) {
      toast.error("No eligible UCSD emails found (active, non-alumni).");
      return;
    }
    toast.success(`Downloaded ${count} newsletter email${count === 1 ? "" : "s"}.`);
  };

  const getColumnByKey = (key: string) => columns.find(c => String(c.key) === key);

  return (
    <div className="mb-4">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Select
            label="Data table"
            fieldId="admin-data-table-picker"
            hideLabel
            showPlaceholderOption={false}
            options={["Events", "Members", "Items", "Attendance", "BoardTeams"]}
            value={tableName}
            setValue={v => {
              setFilterOpen(false);
              setSortOpen(false);
              bridge?.onTableChange(v);
              bridge?.clearSelection();
            }}
            className="min-w-[200px] w-max!"
          />
          <Input
            label="Search table"
            fieldId="admin-data-table-search"
            hideLabel
            type="text"
            placeholder="Search…"
            value={search}
            setValue={setSearch}
            className="min-w-0 w-[200px]"
          />
          {tableName === "Events" && (
            <label
              htmlFor="admin-upcoming-events-only"
              className="flex cursor-pointer items-center gap-2 whitespace-nowrap font-body fl-text-sm/base font-semibold text-(--obs-text-primary)"
            >
              <input
                id="admin-upcoming-events-only"
                type="checkbox"
                className="toggle toggle-primary cursor-pointer"
                checked={showUpcomingEventsOnly}
                onChange={e => setShowUpcomingEventsOnly(e.target.checked)}
              />
              Upcoming only
            </label>
          )}
        </div>
        <span className="order-last font-body fl-text-base/lg font-semibold text-(--obs-text-primary) md:order-0 md:ml-4 md:mr-auto">
          Found {filteredData.length} rows
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reload}
            className="btn btn-outline hover:border-primary font-body fl-text-base/lg font-semibold"
            disabled={loading}
            title="Reload"
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : <TfiReload />}
          </button>
          <button
            type="button"
            onClick={() => (sortOpen ? setSortOpen(false) : openSort())}
            className={`btn btn-outline hover:border-primary font-body fl-text-base/lg font-semibold ${
              sortOpen ? "border-primary" : ""
            }`}
            title="Sort"
            aria-expanded={sortOpen}
          >
            <TfiArrowsVertical /> {sortOrder.length > 0 && `(${sortOrder.length})`}
          </button>
          <button
            type="button"
            onClick={() => (filterOpen ? setFilterOpen(false) : openFilter())}
            className={`btn btn-outline hover:border-primary font-body fl-text-base/lg font-semibold ${
              filterOpen ? "border-primary" : ""
            }`}
            title="Filter"
            aria-expanded={filterOpen}
          >
            <TfiFilter /> {appliedFilterCount > 0 && `(${appliedFilterCount})`}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="btn btn-outline hover:border-primary font-body fl-text-base/lg font-semibold"
            disabled={loading || filteredData.length === 0}
            title="Download as CSV"
          >
            <TfiDownload />
          </button>
          {tableName === "Members" && (
            <button
              type="button"
              onClick={handleNewsletterExport}
              className="btn btn-outline hover:border-primary font-body fl-text-base/lg font-semibold"
              disabled={loading || data.length === 0}
              title="Export newsletter emails (active @ucsd.edu, exclude alumni)"
            >
              <TfiEmail className="mr-1" />
              Newsletter CSV
            </button>
          )}
          <button
            type="button"
            onClick={() => bridge?.clearSelection()}
            className="btn btn-primary font-body fl-text-base/lg font-semibold"
            disabled={!bridge?.canAdd}
            title="Add New"
          >
            <TfiPlus className="font-bold" />
          </button>
        </div>
      </div>

      {sortOpen ? (
        <div
          className="mt-4 w-full rounded-box border border-(--obs-border) bg-base-200 p-4 font-body"
          data-testid="admin-sort-panel"
        >
          <div className="space-y-3">
            {sortDraft.length > 0 ? (
              sortDraft.map((row, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-lg border border-(--obs-border) bg-base-100 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <OptionPicker
                      label="Column"
                      value={row.columnKey}
                      options={sortableColumns.map(col => ({
                        value: String(col.key),
                        label: col.label ?? formatColumnLabel(col.key),
                      }))}
                      onChange={columnKey =>
                        setSortDraft(draft =>
                          draft.map((r, i) => (i === index ? { ...r, columnKey } : r))
                        )
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-square shrink-0"
                      aria-label="Remove sort"
                      onClick={() => setSortDraft(draft => draft.filter((_, i) => i !== index))}
                    >
                      <IoClose />
                    </button>
                  </div>
                  <OptionPicker
                    label="Direction"
                    value={row.direction}
                    options={[
                      { value: "asc", label: "Asc" },
                      { value: "desc", label: "Desc" },
                    ]}
                    onChange={direction =>
                      setSortDraft(draft =>
                        draft.map((r, i) =>
                          i === index ? { ...r, direction: direction as "asc" | "desc" } : r
                        )
                      )
                    }
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-(--obs-text-muted)">No sorts yet — add a column.</p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-(--obs-border) pt-3">
            <button
              type="button"
              className="btn btn-outline"
              disabled={
                sortableColumns.length === 0 ||
                sortableColumns.every(c => sortDraft.some(r => r.columnKey === String(c.key)))
              }
              onClick={() => {
                const used = new Set(sortDraft.map(r => r.columnKey));
                const next = sortableColumns.find(c => !used.has(String(c.key)));
                if (next) {
                  setSortDraft(d => [
                    ...d,
                    { columnKey: String(next.key), direction: "asc" },
                  ]);
                }
              }}
            >
              Add column
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setSortOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary ml-auto" onClick={applySorts}>
              Apply sorts
            </button>
          </div>
        </div>
      ) : null}

      {filterOpen ? (
        <div
          className="mt-4 w-full rounded-box border border-(--obs-border) bg-base-200 p-4 font-body"
          data-testid="admin-filter-panel"
        >
          <div className="space-y-3">
            {filterDraft.length > 0 ? (
              filterDraft.map((row, index) => {
                const col = getColumnByKey(row.columnKey);
                const ops = col ? getFilterOptionsForType(col.type) : FILTER_OPTIONS.text;
                const showValue = needsValue(row.filter);
                return (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded-lg border border-(--obs-border) bg-base-100 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <OptionPicker
                        label="Column"
                        value={row.columnKey}
                        options={filterableColumns.map(c => ({
                          value: String(c.key),
                          label: c.label ?? formatColumnLabel(c.key),
                        }))}
                        onChange={key => {
                          const newCol = getColumnByKey(key);
                          const newOps = newCol
                            ? getFilterOptionsForType(newCol.type)
                            : FILTER_OPTIONS.text;
                          setFilterDraft(draft =>
                            draft.map((r, i) =>
                              i === index
                                ? {
                                    columnKey: key,
                                    filter: newOps[0]?.value ?? "eq",
                                    filterValue: "",
                                  }
                                : r
                            )
                          );
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-square shrink-0"
                        aria-label="Remove filter"
                        onClick={() =>
                          setFilterDraft(draft => draft.filter((_, i) => i !== index))
                        }
                      >
                        <IoClose />
                      </button>
                    </div>
                    <OptionPicker
                      label="Operator"
                      value={row.filter ?? ""}
                      options={ops.map(o => ({
                        value: o.value ?? "",
                        label: o.label,
                      }))}
                      onChange={raw => {
                        const val = (raw || null) as FilterOperator;
                        setFilterDraft(draft =>
                          draft.map((r, i) =>
                            i === index
                              ? {
                                  ...r,
                                  filter: val,
                                  filterValue: needsValue(val) ? r.filterValue : "",
                                }
                              : r
                          )
                        );
                      }}
                    />
                    {showValue ? (
                      <div>
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
                            setFilterDraft(draft =>
                              draft.map((r, i) =>
                                i === index ? { ...r, filterValue: v } : r
                              )
                            )
                          }
                          placeholder="Value"
                          className="min-w-0 w-full!"
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-(--obs-text-muted)">No filters yet — add a column.</p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-(--obs-border) pt-3">
            <button
              type="button"
              className="btn btn-outline"
              disabled={
                filterableColumns.length === 0 ||
                filterableColumns.every(c =>
                  filterDraft.some(r => r.columnKey === String(c.key))
                )
              }
              onClick={() => {
                const used = new Set(filterDraft.map(r => r.columnKey));
                const next = filterableColumns.find(c => !used.has(String(c.key)));
                if (next) {
                  const opts = getFilterOptionsForType(next.type);
                  setFilterDraft(d => [
                    ...d,
                    {
                      columnKey: String(next.key),
                      filter: opts[0]?.value ?? "eq",
                      filterValue: "",
                    },
                  ]);
                }
              }}
            >
              Add column
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setFilterOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary ml-auto" onClick={applyFilters}>
              Apply filters
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
