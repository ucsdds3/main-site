import { useMemo } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

import { boardTeamTabKeys } from "src/Sites/Main/Pages/Board/boardTeamConfig";

import { SPRINT_BOARD_COLUMNS, teamAccent, teamLabel } from "../constants";
import type { SprintRow, SprintTaskRow } from "../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

type SprintStatsProps = {
  tasks: SprintTaskRow[];
  sprint: SprintRow;
  teamTab: string;
};

const AXIS_TICK = "rgba(255,255,255,0.45)";
const AXIS_GRID = "rgba(255,255,255,0.06)";
const AXIS_TITLE = "rgba(255,255,255,0.7)";
const AXIS_FONT = { size: 12, family: "ui-monospace, SFMono-Regular, Menlo, monospace" };

function dayKey(iso: string) {
  const d = iso.length <= 10 ? new Date(`${iso}T00:00:00`) : new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDay(isoDay: string) {
  const d = new Date(`${isoDay}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function addDay(isoDay: string) {
  const [year, month, day] = isoDay.split("-").map(Number);
  const d = new Date(year, month - 1, day + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const next = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${next}`;
}

function firstName(fullName: string) {
  const part = fullName.trim().split(/\s+/)[0];
  return part || fullName;
}

export default function SprintStats({ tasks, sprint, teamTab }: SprintStatsProps) {
  const scoped = useMemo(
    () =>
      tasks.filter(t => t.status !== "cancelled" && (teamTab === "ALL" || t.team_key === teamTab)),
    [tasks, teamTab]
  );

  const people = useMemo(() => {
    const ids = new Set<number>();
    for (const task of scoped) {
      for (const a of task.assignees) ids.add(a.id);
    }
    return ids.size;
  }, [scoped]);

  const done = scoped.filter(t => t.status === "done");
  const open = scoped.filter(t => t.status !== "done");
  const pendingReview = scoped.filter(t => t.status === "pending_review").length;
  const expected = scoped.reduce((sum, t) => sum + t.expected_hours, 0);
  const actual = scoped.reduce((sum, t) => sum + (t.actual_hours ?? 0), 0);
  const openHours = open.reduce((sum, t) => sum + t.expected_hours, 0);
  const avgHours = people === 0 ? 0 : expected / people;
  const avgTasks = people === 0 ? 0 : scoped.length / people;
  const pct = scoped.length === 0 ? 0 : (done.length / scoped.length) * 100;

  const chart = useMemo(() => {
    const start = sprint.starts_on;
    const today = dayKey(new Date().toISOString());
    const end = sprint.ends_on < today ? sprint.ends_on : today;
    const labels: string[] = [];
    let cursor = start;
    let guard = 0;
    while (cursor <= end && guard < 90) {
      labels.push(cursor);
      cursor = addDay(cursor);
      guard += 1;
    }
    if (labels.length === 0) labels.push(start);
    const counts = labels.map(
      day =>
        scoped.filter(t => {
          if (dayKey(t.created_at) > day) return false;
          if (t.status === "done" && t.completed_at && dayKey(t.completed_at) <= day) return false;
          return true;
        }).length
    );
    return { labels: labels.map(formatDay), counts };
  }, [scoped, sprint.ends_on, sprint.starts_on]);

  const hoursBars = useMemo(() => {
    if (teamTab === "ALL") {
      const hours = new Map<string, number>();
      for (const task of scoped) {
        hours.set(task.team_key, (hours.get(task.team_key) ?? 0) + task.expected_hours);
      }
      const keys = boardTeamTabKeys(hours.keys());
      return {
        labels: keys.map(teamLabel),
        values: keys.map(k => Number((hours.get(k) ?? 0).toFixed(1))),
        colors: keys.map(teamAccent),
      };
    }

    const hours = new Map<string, { name: string; hours: number }>();
    for (const task of scoped) {
      const owners =
        task.assignees.length > 0 ? task.assignees : [{ id: 0, full_name: "Unassigned" }];
      const share = task.expected_hours / owners.length;
      for (const owner of owners) {
        const key = String(owner.id);
        const prev = hours.get(key);
        hours.set(key, {
          name: owner.full_name,
          hours: (prev?.hours ?? 0) + share,
        });
      }
    }
    const rows = [...hours.values()].sort(
      (a, b) => b.hours - a.hours || a.name.localeCompare(b.name)
    );
    const accent = teamAccent(teamTab);
    return {
      labels: rows.map(r => firstName(r.name)),
      values: rows.map(r => Number(r.hours.toFixed(1))),
      colors: rows.map(() => accent),
    };
  }, [scoped, teamTab]);

  const byStatus = SPRINT_BOARD_COLUMNS.map(col => ({
    ...col,
    count: scoped.filter(t => t.status === col.status).length,
  }));

  const tiles = [
    { label: "Complete", value: `${Math.round(pct)}%` },
    { label: "Avg expected hours / person", value: avgHours.toFixed(1) },
    { label: "Avg tasks / person", value: avgTasks.toFixed(1) },
    { label: "Expected vs actual hours", value: `${expected.toFixed(1)} / ${actual.toFixed(1)}` },
    { label: "Hours still open", value: openHours.toFixed(1) },
    { label: "Waiting on review", value: String(pendingReview) },
  ];

  const empty = scoped.length === 0;

  return (
    <section className="rounded-2xl border border-(--obs-border) bg-(--obs-surface) p-5">
      <div className="obs-eyebrow-row">
        <div className="obs-accent-bar-cyan" />
        <span className="text-eyebrow text-eyebrow-cyan">Sprint pulse</span>
      </div>
      <h2 className="mt-2 mb-1 text-xl text-(--obs-text-primary)">
        {teamTab === "ALL" ? "All teams" : teamLabel(teamTab)}
      </h2>
      <p className="mt-0 mb-5 text-sm text-(--obs-text-muted)">
        Stats follow the team tab above (not the person search).
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {tiles.map(tile => (
          <div key={tile.label} className="rounded-xl border border-(--obs-border) px-4 py-3">
            <p className="m-0 font-mono text-[0.62rem] uppercase tracking-widest text-(--obs-text-faint)">
              {tile.label}
            </p>
            <p className="mb-0 mt-2 text-2xl text-(--obs-text-primary)">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {byStatus.map(col => (
          <span
            key={col.status}
            className="rounded-full border border-(--obs-border) px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-(--obs-text-muted)"
          >
            {col.label} {col.count}
          </span>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="h-56">
          {empty ? (
            <p className="m-0 pt-10 text-center text-sm text-(--obs-text-faint)">
              Pending work will plot here once this team has tasks.
            </p>
          ) : (
            <Line
              data={{
                labels: chart.labels,
                datasets: [
                  {
                    label: "Tasks pending",
                    data: chart.counts,
                    borderColor: "#F58134",
                    backgroundColor: "rgba(245,129,52,0.2)",
                    tension: 0.25,
                    fill: false,
                    pointRadius: 3,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { left: 4 } },
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    ticks: { color: AXIS_TICK, maxRotation: 0 },
                    grid: { color: AXIS_GRID },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: { color: AXIS_TICK, precision: 0, stepSize: 1 },
                    grid: { color: AXIS_GRID },
                    title: {
                      display: true,
                      text: "Tasks pending",
                      color: AXIS_TITLE,
                      font: AXIS_FONT,
                    },
                  },
                },
              }}
            />
          )}
        </div>
        <div className="h-56">
          {empty ? (
            <p className="m-0 pt-10 text-center text-sm text-(--obs-text-faint)">
              Expected hours will plot here once this team has tasks.
            </p>
          ) : (
            <Bar
              data={{
                labels: hoursBars.labels,
                datasets: [
                  {
                    label: "Expected hours",
                    data: hoursBars.values,
                    backgroundColor: hoursBars.colors.map(c => `${c}cc`),
                    borderColor: hoursBars.colors,
                    borderWidth: 1,
                    borderRadius: 6,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: { left: 4 } },
                plugins: { legend: { display: false } },
                scales: {
                  x: {
                    ticks: {
                      color: AXIS_TICK,
                      maxRotation: 40,
                      minRotation: 0,
                      autoSkip: false,
                    },
                    grid: { display: false },
                  },
                  y: {
                    beginAtZero: true,
                    ticks: { color: AXIS_TICK },
                    grid: { color: AXIS_GRID },
                    title: {
                      display: true,
                      text: "Expected hours",
                      color: AXIS_TITLE,
                      font: AXIS_FONT,
                    },
                  },
                },
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
