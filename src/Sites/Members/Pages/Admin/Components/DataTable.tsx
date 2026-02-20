import { useState, RefObject, useEffect } from "react";
import { TfiReload, TfiDownload, TfiPlus } from "react-icons/tfi";

import { useAdminStore } from "../Hooks/useAdminStore";
import { useAdminFetch } from "../Hooks/useAdminFetch";
import { ColumnDefinition } from "../Utils/types";
import { formatColumnLabel, formatCellValue } from "../../../Utils/functions";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import FilterDropdown from "./FilterDropdown";
import SortDropdown from "./SortDropdown";

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
  onRowSelect,
  reloadRef,
  onTableChange,
  canAdd = false,
}: DataTableProps<T>) {
  const [selectedRow, setSelectedRow] = useState<T | null>(null);

  const setTable = useAdminStore(state => state.setTable);
  const reload = useAdminStore(state => state.reload);
  const data = useAdminStore(state => state.data) as T[];
  const loading = useAdminStore(state => state.loading);

  useAdminFetch();

  useEffect(() => {
    setTable(tableName, columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName]);

  const handleRowSelect = (row: T | null) => {
    setSelectedRow(row);
    onRowSelect?.(row);
  };

  const clearSelection = () => {
    setSelectedRow(null);
    onRowSelect?.(null);
  };

  const handleDownload = () => {
    const visibleColumns = columns.filter(col => !col.hide);
    const visibleData =
      tableName === "Attendance" ? data : data.filter(row => row.deleted !== true);

    const headers = visibleColumns.map(col => formatColumnLabel(col.key));
    const rows = visibleData.map(row =>
      visibleColumns.map(col => {
        const value = row[col.key];
        const formatted = formatCellValue(value, col.type);
        return `"${String(formatted).replace(/"/g, '""')}"`;
      })
    );

    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${tableName}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (reloadRef) {
    reloadRef.current = { reload, clearSelection };
  }

  return (
    <div className="w-full bg-base-300 rounded-xl p-6 min-w-0 h-fit border border-base-content/50">
      <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <select
            className="select select-bordered text-lg font-semibold py-2 w-[200px]"
            value={tableName}
            onChange={e => {
              onTableChange(e.target.value);
              clearSelection();
            }}
          >
            <option value="Events">Events</option>
            <option value="Members">Members</option>
            <option value="Items">Items</option>
            <option value="Attendance">Attendance</option>
          </select>
        </div>
        <span className="text-lg font-semibold md:ml-4 md:mr-auto order-last md:order-0">
          Found{" "}
          {tableName === "Attendance"
            ? data.length
            : data.filter(row => row.deleted !== true).length}{" "}
          rows
        </span>
        <div className="flex gap-2 items-center">
          <FilterDropdown />
          <SortDropdown />
          <button
            onClick={reload}
            className="btn btn-outline hover:border-primary text-lg font-bold"
            disabled={loading}
            title="Reload"
          >
            {loading ? <span className="loading loading-spinner loading-sm" /> : <TfiReload />}
          </button>
          <button
            onClick={handleDownload}
            className="btn btn-outline hover:border-primary text-lg font-bold"
            disabled={loading || data.length === 0}
            title="Download as CSV"
          >
            <TfiDownload />
          </button>
          <button
            onClick={clearSelection}
            className="btn btn-primary text-lg font-bold"
            disabled={!canAdd}
            title="Add New"
          >
            <TfiPlus className="font-bold" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] rounded-lg border border-primary">
        <table className="table table-zebra w-full">
          <TableHeader columns={columns} />
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
