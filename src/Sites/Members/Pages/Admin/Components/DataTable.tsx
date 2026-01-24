import { useState } from "react";
import { TfiReload } from "react-icons/tfi";

import { useTableData, ColumnSortFilter } from "../Hooks/useTableData";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import { ColumnDefinition } from "../Utils/types";

export interface DataTableProps<T = any> {
  tableName: string;
  columns: ColumnDefinition<T>[];
  initialData?: T[];
  onRowSelect?: (row: T | null) => void;
  reloadRef?: React.MutableRefObject<{ reload: () => void; clearSelection: () => void } | null>;
}

export default function DataTable<T extends Record<string, any>>({
  tableName,
  columns,
  initialData,
  onRowSelect,
  reloadRef,
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
    <div className="w-full bg-base-300 rounded-xl p-6 min-w-0 h-fit">
      <div className="flex justify-between mb-4 px-2">
        <h2 className="text-3xl font-semibold capitalize">{tableName}</h2>
        <div className="flex gap-2">
          <button onClick={clearSelection} className="btn btn-primary font-bold">
            + Add New
          </button>
          <button
            onClick={reload}
            className="btn btn-primary font-bold"
            disabled={loading}
            title="Reload"
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : <TfiReload />}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] rounded-lg border border-base-content/20">
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
