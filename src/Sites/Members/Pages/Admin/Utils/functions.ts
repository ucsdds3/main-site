import { ColumnType } from "./types";

/**
 * Formats a cell value for display based on its column type
 */
export function formatCellValue(value: any, type: ColumnType): string {
  if (value === null || value === undefined) return "-";
  switch (type) {
    case "boolean":
      return value ? "Yes" : "No";
    case "date":
      return new Date(value).toLocaleString();
    case "array":
      return Array.isArray(value) ? value.join(", ") : String(value);
    case "json":
      return JSON.stringify(value);
    default:
      return String(value);
  }
}

/**
 * Converts a filter/form input value to the appropriate type based on column type
 */
export function convertFilterValue(value: string, type: ColumnType): any {
  if (!value) return null;
  switch (type) {
    case "number":
      return Number(value);
    case "boolean":
      return value === "true" || value === "1";
    case "date":
      return value;
    case "array":
    case "json":
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

/**
 * Processes a form input value based on its column type
 */
export function processFormValue(value: any, type: ColumnType): any {
  if (type === "number") {
    return value === "" ? 0 : Number(value);
  } else if (type === "boolean") {
    return value === "true" || value === true;
  } else if (type === "array" || type === "json") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}
