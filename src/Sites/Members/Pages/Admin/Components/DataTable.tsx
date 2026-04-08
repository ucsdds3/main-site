import { useMemo, useState, RefObject, useEffect } from "react";

import { useAdminStore } from "../Hooks/useAdminStore";
import { useAdminFetch } from "../Hooks/useAdminFetch";
import { ColumnDefinition } from "../Utils/types";
import { filterAdminTableRows } from "../Utils/dataTableHelpers";

import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import DataTableControls from "./DataTableControls";

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
  const dataTableSearch = useAdminStore(state => state.dataTableSearch);
  const setDataTableUiBridge = useAdminStore(state => state.setDataTableUiBridge);

  useAdminFetch();

  useEffect(() => {
    setTable(tableName, columns);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName]);

  useEffect(() => {
    setDataTableUiBridge({
      onTableChange,
      clearSelection: () => {
        setSelectedRow(null);
        onRowSelect?.(null);
      },
      canAdd,
    });
    return () => setDataTableUiBridge(null);
  }, [canAdd, onRowSelect, onTableChange, setDataTableUiBridge]);

  const filteredData = useMemo(
    () => filterAdminTableRows(tableName, columns, data, dataTableSearch),
    [columns, data, dataTableSearch, tableName]
  );

  const handleRowSelect = (row: T | null) => {
    setSelectedRow(row);
    onRowSelect?.(row);
  };

  const clearSelection = () => {
    setSelectedRow(null);
    onRowSelect?.(null);
  };

  if (reloadRef) {
    reloadRef.current = { reload, clearSelection };
  }

  return (
    <div className="obs-panel h-fit min-w-0 w-full p-6 font-body">
      <DataTableControls />

      <div className="max-h-[70vh] overflow-x-auto overflow-y-auto rounded-lg border border-(--obs-border)">
        <table className="table w-full font-body">
          <TableHeader columns={columns} />
          <TableBody
            columns={columns}
            data={filteredData}
            loading={loading}
            selectedRow={selectedRow}
            onRowSelect={handleRowSelect}
          />
        </table>
      </div>
    </div>
  );
}
