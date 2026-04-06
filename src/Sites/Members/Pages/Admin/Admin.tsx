import { useState, useRef } from "react";

import Page from "src/Shared/Page/Page";

import EditCard from "./Components/EditCard";
import DataTable from "./Components/DataTable";
import { ColumnDefinition, AdminLevel } from "./Utils/types";
import tablesData from "./Data/tables.json";
import { useAuthStore } from "src/Sites/Members/Hooks/useAuthStore";

type TableType = "Events" | "Members" | "Items" | "Attendance";

export default function AdminDashboardOnePage() {
  const [currentTable, setCurrentTable] = useState<TableType>("Events");
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const reloadRef = useRef<{ reload: () => void; clearSelection: () => void } | null>(null);
  const { adminLevel } = useAuthStore();

  const getTableData = () => {
    return tablesData[currentTable as keyof typeof tablesData];
  };

  const getColumns = (): ColumnDefinition<any>[] => {
    const tableData = getTableData();
    const columnsObj = tableData.columns;

    return Object.entries(columnsObj).map(([key, col]) => ({
      ...col,
      key,
    })) as ColumnDefinition<any>[];
  };

  const canAdd = (): boolean => {
    const tableData = getTableData();
    const allowedLevels = tableData.permissions.canAdd as AdminLevel[];
    return adminLevel !== null && allowedLevels.includes(adminLevel);
  };

  const canEdit = (): boolean => {
    const tableData = getTableData();
    const allowedLevels = tableData.permissions.canEdit as AdminLevel[];
    return adminLevel !== null && allowedLevels.includes(adminLevel);
  };

  const handleTableChange = (tableName: string) => {
    setCurrentTable(tableName as TableType);
    setSelectedRow(null);
  };

  return (
    <Page data-theme="dark">
      <div className="mx-auto max-w-[1800px] px-6 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 w-full">
          <DataTable
            tableName={currentTable}
            columns={getColumns()}
            onRowSelect={setSelectedRow}
            reloadRef={reloadRef}
            onTableChange={handleTableChange}
            canAdd={canAdd()}
          />

          <EditCard
            tableName={currentTable}
            columns={getColumns()}
            selectedRow={selectedRow}
            reloadRef={reloadRef}
            canEdit={canEdit()}
            canAdd={canAdd()}
          />
        </div>
      </div>
    </Page>
  );
}
