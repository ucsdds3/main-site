import { formatColumnLabel, formatCellValue } from "../../../Utils/functions";

import type { ColumnDefinition } from "./types";

export function filterAdminTableRows<T extends Record<string, any>>(
  tableName: string,
  columns: ColumnDefinition<T>[],
  data: T[],
  search: string
): T[] {
  const visibleColumns = columns.filter(col => !col.hide);
  const baseData =
    tableName === "Attendance" ? data : data.filter(row => row.deleted !== true);

  const q = search.trim().toLowerCase();
  if (!q) return baseData;

  return baseData.filter(row =>
    visibleColumns.some(col => {
      const value = row[col.key];
      const formatted = formatCellValue(value, col.type);
      return String(formatted ?? "").toLowerCase().includes(q);
    })
  );
}

export function downloadAdminTableCsv<T extends Record<string, any>>(
  tableName: string,
  columns: ColumnDefinition<T>[],
  filteredRows: T[]
): void {
  const visibleColumns = columns.filter(col => !col.hide);

  const headers = visibleColumns.map(col => formatColumnLabel(col.key));
  const rows = filteredRows.map(row =>
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
}
