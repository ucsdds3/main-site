import { useState } from "react";

import { ColumnDefinition } from "../Utils/types";

export type SortOrderEntry = { columnKey: string; direction: "asc" | "desc" };

export interface UseSortOptions<T = any> {
  columns: ColumnDefinition<T>[];
}

export interface UseSortReturn {
  sortOrder: SortOrderEntry[];
  sortDropdownOpen: boolean;
  sortDraft: SortOrderEntry[];
  sortableColumns: ColumnDefinition[];
  openSortDropdown: () => void;
  applySorts: () => void;
  addSortRow: () => void;
  updateSortRow: (index: number, columnKey?: string, direction?: "asc" | "desc") => void;
  removeSortRow: (index: number) => void;
  clearSorts: () => void;
  setSortDropdownOpen: (open: boolean) => void;
}

export function useSort<T extends Record<string, any>>({
  columns,
}: UseSortOptions<T>): UseSortReturn {
  const [sortOrder, setSortOrder] = useState<SortOrderEntry[]>([]);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortDraft, setSortDraft] = useState<SortOrderEntry[]>([]);

  const sortableColumns = columns.filter(
    col => !col.hide && col.type !== "qr_code" && !col.join
  );

  const openSortDropdown = () => {
    setSortDraft([...sortOrder]);
    setSortDropdownOpen(true);
  };

  const applySorts = () => {
    setSortOrder(sortDraft.filter(row => row.columnKey));
    setSortDropdownOpen(false);
  };

  const addSortRow = () => {
    const usedKeys = new Set(sortDraft.map(r => r.columnKey));
    const firstUnused = sortableColumns.find(c => !usedKeys.has(String(c.key)));
    if (firstUnused) {
      setSortDraft([...sortDraft, { columnKey: String(firstUnused.key), direction: "asc" }]);
    }
  };

  const updateSortRow = (index: number, columnKey?: string, direction?: "asc" | "desc") => {
    setSortDraft(prev =>
      prev.map((row, i) =>
        i === index
          ? {
              columnKey: columnKey ?? row.columnKey,
              direction: direction ?? row.direction,
            }
          : row
      )
    );
  };

  const removeSortRow = (index: number) => {
    setSortDraft(prev => prev.filter((_, i) => i !== index));
  };

  const clearSorts = () => {
    setSortOrder([]);
  };

  return {
    sortOrder,
    sortDropdownOpen,
    sortDraft,
    sortableColumns,
    openSortDropdown,
    applySorts,
    addSortRow,
    updateSortRow,
    removeSortRow,
    clearSorts,
    setSortDropdownOpen,
  };
}
