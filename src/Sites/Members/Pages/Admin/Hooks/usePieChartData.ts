import { useState, useEffect } from "react";
import { supabase } from "src/Utils/supabase";

export type PieChartGrouping = "timeOfDay" | "tag" | "venue" | "year" | "major";

export interface PieChartRpcRow {
  label: string;
  data: number;
}

export interface PieChartDataState {
  timeOfDay: number[];
  tag: number[];
  venue: number[];
  year: number[];
  major: number[];
}

export interface PieChartLabelState {
  timeOfDay: string[];
  tag: string[];
  venue: string[];
  year: string[];
  major: string[];
}

const initialLabel: PieChartLabelState = {
  timeOfDay: [],
  tag: [],
  venue: [],
  year: [],
  major: [],
};

const initialData: PieChartDataState = {
  timeOfDay: [],
  tag: [],
  venue: [],
  year: [],
  major: [],
};

function toLabel(rows: PieChartRpcRow[]): string[] {
  return rows.map((r) => r.label);
}

function toData(rows: PieChartRpcRow[]): number[] {
  return rows.map((r) => Number(r.data));
}

function asRpcRows(raw: unknown): PieChartRpcRow[] {
  return Array.isArray(raw) ? (raw as PieChartRpcRow[]) : [];
}

export function usePieChartData() {
  const [label, setLabel] = useState<PieChartLabelState>(initialLabel);
  const [data, setData] = useState<PieChartDataState>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);

      const [
        { data: timeOfDayRows, error: timeOfDayError },
        { data: tagRows, error: tagError },
        { data: venueRows, error: venueError },
        { data: yearRows, error: yearError },
        { data: majorRows, error: majorError },
      ] = await Promise.all([
        supabase.rpc("get_attendance_distribution_by_time_of_day"),
        supabase.rpc("get_event_tag_percents"),
        supabase.rpc("get_event_venue_percents"),
        supabase.rpc("get_member_distribution_by_year"),
        supabase.rpc("get_member_distribution_by_major"),
      ]);

      if (cancelled) return;

      const err =
        timeOfDayError?.message ||
        tagError?.message ||
        venueError?.message ||
        yearError?.message ||
        majorError?.message ||
        null;
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }

      setLabel({
        timeOfDay: toLabel(asRpcRows(timeOfDayRows)),
        tag: toLabel(asRpcRows(tagRows)),
        venue: toLabel(asRpcRows(venueRows)),
        year: toLabel(asRpcRows(yearRows)),
        major: toLabel(asRpcRows(majorRows)),
      });

      setData({
        timeOfDay: toData(asRpcRows(timeOfDayRows)),
        tag: toData(asRpcRows(tagRows)),
        venue: toData(asRpcRows(venueRows)),
        year: toData(asRpcRows(yearRows)),
        major: toData(asRpcRows(majorRows)),
      });

      setLoading(false);
    }

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  return { label, data, loading, error };
}
