import { useState, RefObject } from "react";
import { TfiReload } from "react-icons/tfi";

import { useTableData, ColumnSortFilter } from "../Hooks/useTableData";
import { ColumnDefinition } from "../Utils/types";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";

export interface DataTableProps<T = any> {
  tableName: string;
  columns: ColumnDefinition<T>[];
  initialData?: T[];
  onRowSelect?: (row: T | null) => void;
  reloadRef?: RefObject<{ reload: () => void; clearSelection: () => void } | null>;
  onTableChange: (tableName: string) => void;
  canAdd?: boolean;
}

export default function DataTable<T extends Record<string, any>>({
  tableName,
  columns,
  initialData,
  onRowSelect,
  reloadRef,
  onTableChange,
  canAdd = false,
}: DataTableProps<T>) {
  const [columnStates, setColumnStates] = useState<Record<string, ColumnSortFilter>>({});
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);

  const handleRowSelect = (row: T | null) => {
    setSelectedRow(row);
    onRowSelect?.(row);
  };

  const reload = () => {
    setReloadTrigger(prev => prev + 1);
  };

  const clearSelection = () => {
    setSelectedRow(null);
    onRowSelect?.(null);
  };

  const resetFiltersAndSort = () => {
    setColumnStates({});
  };

  // Expose reload and clearSelection functions via ref
  if (reloadRef) {
    reloadRef.current = { reload, clearSelection };
  }

  const { data, loading } = useTableData<T>(
    tableName,
    columns,
    initialData,
    columnStates,
    reloadTrigger
  );

  return (
    <div className="w-full bg-base-300 rounded-xl p-6 min-w-0 h-fit border border-base-content/50">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <select
            className="select select-bordered text-lg font-semibold py-2 max-w-[200px]"
            value={tableName}
            onChange={e => {
              onTableChange(e.target.value);
              clearSelection();
            }}
          >
            <option value="Events">Events</option>
            <option value="Members">Members</option>
            <option value="Items">Items</option>
          </select>
          <span className="text-lg font-semibold w-60">
            Found {data.filter(row => row.deleted !== true).length} rows
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearSelection}
            className="btn btn-primary text-lg font-bold"
            disabled={!canAdd}
          >
            Add New
          </button>
          <button
            onClick={resetFiltersAndSort}
            className="btn btn-outline text-lg font-bold"
            title="Reset filters and sort"
          >
            Reset
          </button>
          <button
            onClick={reload}
            className="btn btn-outline text-lg font-bold"
            disabled={loading}
            title="Reload"
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : <TfiReload />}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] rounded-lg border border-base-content/30">
        <table className="table table-zebra w-full">
          <TableHeader
            columns={columns}
            columnStates={columnStates}
            setColumnStates={setColumnStates}
          />
          <TableBody
            columns={columns}
            data={data}
            loading={loading}
            selectedRow={selectedRow}
            onRowSelect={handleRowSelect}
          />
        </table>
      </div>
    </div>
  );
}
