import { useState, useEffect, useMemo } from "react";
import { supabase } from "src/Utils/supabase";

export type LineChartGroupBy = "daily" | "weekly" | "monthly" | "quarterly";

export interface AttendanceRecord {
  id: number;
  created_at: string;
}

export interface GroupedAttendanceItem {
  label: string;
  count: number;
}

function getDayKey(iso: string): string {
  return iso.slice(0, 10);
}

function getWeekKey(iso: string): string {
  const d = new Date(iso);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
  const monday = new Date(d);
  monday.setDate(diff);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, "0");
  const date = String(monday.getDate()).padStart(2, "0");
  return `${y}-${m}-${date}`;
}

function getMonthKey(iso: string): string {
  return iso.slice(0, 7);
}

function getQuarterKey(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${year}-Q${q}`;
}

const KEY_FN: Record<LineChartGroupBy, (iso: string) => string> = {
  daily: getDayKey,
  weekly: getWeekKey,
  monthly: getMonthKey,
  quarterly: getQuarterKey,
};

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}

/** Generate all period keys from min to max (inclusive) for the given groupBy. */
function allKeysInRange(minIso: string, maxIso: string, groupBy: LineChartGroupBy): string[] {
  const keys: string[] = [];
  const min = new Date(minIso);
  const max = new Date(maxIso);

  if (groupBy === "daily") {
    const start = new Date(min.getFullYear(), min.getMonth(), min.getDate());
    let d = new Date(start);
    while (d <= max) {
      keys.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      );
      d = addDays(d, 1);
    }
    return keys;
  }

  if (groupBy === "weekly") {
    const day = min.getDay();
    const diff = min.getDate() - day + (day === 0 ? -6 : 1);
    let d = new Date(min.getFullYear(), min.getMonth(), diff);
    while (d <= max) {
      keys.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      );
      d = addDays(d, 7);
    }
    return keys;
  }

  if (groupBy === "monthly") {
    let d = new Date(min.getFullYear(), min.getMonth(), 1);
    while (d <= max) {
      keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      d = addMonths(d, 1);
    }
    return keys;
  }

  // quarterly
  const q = Math.floor(min.getMonth() / 3) + 1;
  let d = new Date(min.getFullYear(), (q - 1) * 3, 1);
  while (d <= max) {
    const year = d.getFullYear();
    const quarter = Math.floor(d.getMonth() / 3) + 1;
    keys.push(`${year}-Q${quarter}`);
    d = addMonths(d, 3);
  }
  return keys;
}

function groupByPeriod(
  records: AttendanceRecord[],
  groupBy: LineChartGroupBy
): GroupedAttendanceItem[] {
  const keyFn = KEY_FN[groupBy];
  const countMap = new Map<string, number>();
  for (const r of records) {
    const key = keyFn(r.created_at);
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  if (records.length === 0) {
    return [];
  }

  const minIso = records[0].created_at;
  const maxIso = records[records.length - 1].created_at;
  const sortedKeys = allKeysInRange(minIso, maxIso, groupBy);

  return sortedKeys.map((label) => ({ label, count: countMap.get(label) ?? 0 }));
}

/** Filter records by date range (YYYY-MM-DD; empty string = no filter). */
function filterByDateRange(
  records: AttendanceRecord[],
  startDate: string,
  endDate: string
): AttendanceRecord[] {
  if (!startDate && !endDate) return records;
  return records.filter((r) => {
    const day = r.created_at.slice(0, 10);
    if (startDate && day < startDate) return false;
    if (endDate && day > endDate) return false;
    return true;
  });
}

export function useLineChartData() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [groupBy, setGroupBy] = useState<LineChartGroupBy>("weekly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAttendance() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("Attendance")
        .select("id, created_at")
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setAttendanceData(data);
      setLoading(false);
    }

    fetchAttendance();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredData = useMemo(
    () => filterByDateRange(attendanceData, startDate, endDate),
    [attendanceData, startDate, endDate]
  );

  const groupedData = useMemo(
    () => groupByPeriod(filteredData, groupBy),
    [filteredData, groupBy]
  );

  return {
    groupedData,
    groupBy,
    setGroupBy,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    error,
  };
}
