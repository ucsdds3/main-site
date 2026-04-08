import { create } from "zustand";

import { ColumnDefinition, FilterOperator, SortDirection } from "../Utils/types";

export type SortOrderEntry = { columnKey: string; direction: "asc" | "desc" };

export type FilterDraftEntry = {
  columnKey: string;
  filter: FilterOperator;
  filterValue: string;
};

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
  sortDraft: SortOrderEntry[];
  sortDropdownOpen: boolean;
  filterDraft: FilterDraftEntry[];
  filterDropdownOpen: boolean;
  reloadTrigger: number;
  dataTableSearch: string;
  dataTableUiBridge: DataTableUiBridge | null;
}

interface AdminStoreActions {
  setTable: (tableName: string, columns: ColumnDefinition[]) => void;
  reload: () => void;
  setDataTableSearch: (search: string) => void;
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
  sortDraft: [],
  sortDropdownOpen: false,
  filterDraft: [],
  filterDropdownOpen: false,
  reloadTrigger: 0,
  dataTableSearch: "",
  dataTableUiBridge: null,

  setTable: (tableName, columns) =>
    set({
      tableName,
      columns,
      sortableColumns: getSortableColumns(columns),
      filterableColumns: getFilterableColumns(columns),
      sortOrder: [],
      sortDraft: [],
      filterDraft: [],
      columnStates: {},
      dataTableSearch: "",
    }),

  setDataTableSearch: search => set({ dataTableSearch: search }),

  setDataTableUiBridge: bridge => set({ dataTableUiBridge: bridge }),

  reload: () =>
    set(state => ({
      reloadTrigger: state.reloadTrigger + 1,
      columnStates: {},
      sortOrder: [],
    })),
}));
