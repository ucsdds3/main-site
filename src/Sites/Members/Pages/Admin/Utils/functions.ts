import { ColumnType } from "./types";

/**
 * Converts snake_case to Title Case
 */
export function formatColumnLabel(key: string | number | symbol): string {
  const str = String(key);
  return str
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

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

/**
 * Converts UTC ISO string to PST datetime-local format
 */
export function convertUTCToPST(utcDateString: string): string {
  if (!utcDateString) return "";
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date(utcDateString));
  const year = parts.find(p => p.type === "year")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  const hour = parts.find(p => p.type === "hour")?.value;
  const minute = parts.find(p => p.type === "minute")?.value;
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Converts PST datetime-local string to UTC ISO string
 */
export function convertPSTToUTC(pstDateString: string): string {
  if (!pstDateString) return "";
  const [datePart, timePart] = pstDateString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  const localDate = new Date(dateStr);
  const pstTime = localDate.toLocaleString("en-US", { timeZone: "America/Los_Angeles", hour12: false });
  const utcTime = localDate.toLocaleString("en-US", { timeZone: "UTC", hour12: false });
  const pstDate = new Date(pstTime);
  const utcDate = new Date(utcTime);
  const offsetMs = utcDate.getTime() - pstDate.getTime();
  return new Date(localDate.getTime() + offsetMs).toISOString();
}
