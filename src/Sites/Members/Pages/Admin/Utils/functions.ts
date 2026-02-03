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
export function formatCellValue(value: unknown, type: ColumnType): string {
  if (value === null || value === undefined) return "-";
  switch (type) {
    case "boolean":
      return value ? "Yes" : "No";
    case "date":
      return new Date(String(value)).toLocaleString();
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
export function convertFilterValue(value: string, type: ColumnType) {
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
export function processFormValue(value: unknown, type: ColumnType) {
  if (type === "number") {
    return value === "" ? 0 : Number(value);
  } else if (type === "boolean") {
    return value === "true" || value === true;
  } else if (type === "array" || type === "json") {
    try {
      return JSON.parse(String(value));
    } catch {
      return value;
    }
  }
  return value;
}

/**
 * Converts UTC ISO string to PST datetime-local format
 * Simple: format UTC date as PST timezone
 */
export function convertUTCToPST(utcDateString: string): string {
  if (!utcDateString) return "";
  const date = new Date(utcDateString);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === "year")?.value;
  const month = parts.find(p => p.type === "month")?.value;
  const day = parts.find(p => p.type === "day")?.value;
  const hour = parts.find(p => p.type === "hour")?.value;
  const minute = parts.find(p => p.type === "minute")?.value;
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Converts PST datetime-local string to UTC ISO string
 * Simple: treat input as PST time, convert to UTC
 */
export function convertPSTToUTC(pstDateString: string): string {
  if (!pstDateString) return "";
  // Parse the datetime-local string (no timezone info)
  const [datePart, timePart] = pstDateString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Create a date string that represents this time in PST
  // We'll create it in UTC first, then adjust
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;

  // Create a formatter to check PST timezone
  const pstFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Try adding common PST offsets to find the UTC time that formats to our target
  // PST is UTC-8, PDT is UTC-7
  for (const offsetHours of [8, 7]) {
    const testUTC = new Date(dateStr + "Z");
    const adjustedUTC = new Date(testUTC.getTime() + offsetHours * 60 * 60 * 1000);
    const parts = pstFormatter.formatToParts(adjustedUTC);
    const y = parts.find(p => p.type === "year")?.value;
    const m = parts.find(p => p.type === "month")?.value;
    const d = parts.find(p => p.type === "day")?.value;
    const h = parts.find(p => p.type === "hour")?.value;
    const min = parts.find(p => p.type === "minute")?.value;
    const formatted = `${y}-${m}-${d}T${h}:${min}`;

    if (formatted === pstDateString) {
      return adjustedUTC.toISOString();
    }
  }

  // Fallback: use 8 hour offset (PST)
  const fallbackUTC = new Date(dateStr + "Z");
  return new Date(fallbackUTC.getTime() + 8 * 60 * 60 * 1000).toISOString();
}
