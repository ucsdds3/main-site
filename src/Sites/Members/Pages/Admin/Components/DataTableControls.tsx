import { useMemo } from "react";
import { TfiReload, TfiDownload, TfiPlus } from "react-icons/tfi";

import { useAdminStore } from "../Hooks/useAdminStore";
import { downloadAdminTableCsv, filterAdminTableRows } from "../Utils/dataTableHelpers";
import { Input } from "src/Sites/Members/Components/Input";
import Select from "src/Sites/Members/Components/Select";

import FilterDropdown from "./FilterDropdown";
import SortDropdown from "./SortDropdown";

export default function DataTableControls() {
  const tableName = useAdminStore(state => state.tableName);
  const columns = useAdminStore(state => state.columns);
  const data = useAdminStore(state => state.data);
  const loading = useAdminStore(state => state.loading);
  const reload = useAdminStore(state => state.reload);
  const search = useAdminStore(state => state.dataTableSearch);
  const setSearch = useAdminStore(state => state.setDataTableSearch);
  const bridge = useAdminStore(state => state.dataTableUiBridge);

  const filteredData = useMemo(
    () => filterAdminTableRows(tableName, columns, data as Record<string, any>[], search),
    [columns, data, search, tableName]
  );

  const handleDownload = () => {
    downloadAdminTableCsv(tableName, columns, filteredData);
  };

  return (
    <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
      <div className="flex items-center gap-4">
        <Select
          label="Data table"
          fieldId="admin-data-table-picker"
          hideLabel
          showPlaceholderOption={false}
          options={["Events", "Members", "Items", "Attendance"]}
          value={tableName}
          setValue={v => {
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
        <SortDropdown />
        <FilterDropdown />
        <button
          type="button"
          onClick={handleDownload}
          className="btn btn-outline hover:border-primary font-body fl-text-base/lg font-semibold"
          disabled={loading || filteredData.length === 0}
          title="Download as CSV"
        >
          <TfiDownload />
        </button>
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
  );
}
