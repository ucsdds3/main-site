import { create } from "zustand";

import { ColumnDefinition, FilterOperator, SortDirection } from "../Utils/types";

export type SortOrderEntry = { columnKey: string; direction: "asc" | "desc" };

export interface ColumnSortFilter {
  sort: SortDirection;
  filter: FilterOperator;
  filterValue: string;
}

const getSortableColumns = (columns: ColumnDefinition[]) =>
  columns.filter(col => !col.hide && col.type !== "qr_code" && !col.join);

const getFilterableColumns = (columns: ColumnDefinition[]) =>
  columns.filter(col => !col.hide && col.type !== "qr_code" && !col.join);

export type DataTableUiBridge = {
  onTableChange: (tableName: string) => void;
  clearSelection: () => void;
  canAdd: boolean;
};

interface AdminStoreState {
  tableName: string;
  columns: ColumnDefinition[];
  sortableColumns: ColumnDefinition[];
  filterableColumns: ColumnDefinition[];
  data: unknown[];
  loading: boolean;
  columnStates: Record<string, ColumnSortFilter>;
  sortOrder: SortOrderEntry[];
  reloadTrigger: number;
  dataTableSearch: string;
  /** Events table: when true, hide rows whose effective end is in the past. */
  showUpcomingEventsOnly: boolean;
  dataTableUiBridge: DataTableUiBridge | null;
}

interface AdminStoreActions {
  setTable: (tableName: string, columns: ColumnDefinition[]) => void;
  reload: () => void;
  setDataTableSearch: (search: string) => void;
  setShowUpcomingEventsOnly: (value: boolean) => void;
  setDataTableUiBridge: (bridge: DataTableUiBridge | null) => void;
}

export const useAdminStore = create<AdminStoreState & AdminStoreActions>(set => ({
  tableName: "",
  columns: [],
  sortableColumns: [],
  filterableColumns: [],
  data: [],
  loading: false,
  columnStates: {},
  sortOrder: [],
  reloadTrigger: 0,
  dataTableSearch: "",
  showUpcomingEventsOnly: false,
  dataTableUiBridge: null,

  setTable: (tableName, columns) =>
    set({
      tableName,
      columns,
      sortableColumns: getSortableColumns(columns),
      filterableColumns: getFilterableColumns(columns),
      sortOrder: [],
      columnStates: {},
      dataTableSearch: "",
      showUpcomingEventsOnly: false,
    }),

  setDataTableSearch: search => set({ dataTableSearch: search }),

  setShowUpcomingEventsOnly: value => set({ showUpcomingEventsOnly: value }),

  setDataTableUiBridge: bridge => set({ dataTableUiBridge: bridge }),

  reload: () =>
    set(state => ({
      reloadTrigger: state.reloadTrigger + 1,
      columnStates: {},
      sortOrder: [],
    })),
}));
